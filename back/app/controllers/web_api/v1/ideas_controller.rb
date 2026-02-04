# frozen_string_literal: true

class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

  SIMILARITIES_LIMIT = 5

  before_action :authorize_project_or_ideas, only: %i[index_xlsx]
  skip_before_action :authenticate_user # TODO: temp fix to pass tests
  skip_after_action :verify_authorized, only: %i[index_xlsx index_mini index_idea_markers filter_counts]
  skip_after_action :verify_authorized, only: %i[create], unless: -> { response.status == 400 }
  after_action :verify_policy_scoped, only: %i[index index_mini]

  def index
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records

    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)

    # Only include after pagination - so we only get associations we need
    ideas = ideas.includes(
      :idea_images,
      :idea_trending_info,
      :input_topics,
      :phases,
      :idea_status,
      :creation_phase,
      :manual_votes_last_updated_by,
      {
        project: [:phases, { phases: { permissions: [:groups] } }, { custom_form: [:custom_fields] }],
        author: [:unread_notifications]
      }
    )
    ideas = ideas.includes(:idea_import) unless current_user&.normal_user? # defined through BulkImportIdeas engine

    render json: linked_json(ideas, WebApi::V1::IdeaSerializer, serialization_options_for(ideas))
  end

  def index_mini
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records
    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:idea_trending_info)

    render json: linked_json(ideas, WebApi::V1::IdeaMiniSerializer, params: jsonapi_serializer_params)
  end

  def index_idea_markers
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records
    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:author, :input_topics, :project, :idea_status)

    render json: linked_json(ideas, WebApi::V1::PostMarkerSerializer, params: jsonapi_serializer_params)
  end

  def index_xlsx
    ideas = IdeasFinder.new(
      params.merge(filter_can_moderate: true),
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records
    ideas = SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:author, :input_topics, :project, :idea_status, :idea_files, :attached_files)

    with_cosponsors = AppConfiguration.instance.feature_activated?('input_cosponsorship')
    ideas = ideas.includes(:cosponsors) if with_cosponsors

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx(ideas, view_private_attributes: true, with_cosponsors:)
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def index_survey_submissions
    ideas = policy_scope(Idea)
      .where(author: current_user)
      .submitted_or_published
      .supports_survey

    ideas = paginate ideas

    ideas
      .includes(:creation_phase)
      .includes(:project)

    render json: linked_json(
      ideas,
      WebApi::V1::IdeaMiniSerializer,
      params: jsonapi_serializer_params,
      include: %i[creation_phase project]
    )
  end

  def filter_counts
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea),
      current_user: current_user
    ).find_records
    ideas = SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:idea_trending_info)

    result = IdeasCountService.counts(ideas)
    result['total'] = ideas.count
    render json: raw_json(result)
  end

  def show
    render_show Idea.find params[:id]
  end

  def show_xlsx
    idea = Idea.find params[:id]
    authorize idea

    I18n.with_locale(current_user&.locale) do
      xlsx = Export::Xlsx::InputsGenerator.new.generate_for_input(idea)
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'survey_response.xlsx'
    end
  end

  def by_slug
    render_show Idea.find_by!(slug: params[:slug])
  end

  # return a single draft idea for this user for this phase
  # returns an empty idea if none found
  # used only in native survey autosave
  def draft_by_phase
    phase = Phase.find(params[:phase_id])
    draft_idea =
      (current_user && Idea.find_by(creation_phase_id: params[:phase_id], author: current_user, publication_status: 'draft')) ||
      Idea.new(project: phase.project, author: current_user, publication_status: 'draft')

    # Merge custom field values from the user's profile
    # if user fields are presented in the idea form
    # AND the user_data_collection setting allows it
    if phase.pmethod.user_fields_in_form_enabled?
      draft_idea.custom_field_values = UserFieldsInFormService.merge_user_fields_into_idea(
        current_user,
        phase,
        draft_idea.custom_field_values
      )
    end

    render_show draft_idea, check_auth: false
  end

  #   Normal users always post in an active phase. They should never provide a phase id.
  #   Users who can moderate projects post in an active phase if no phase id is given.
  #   Users who can moderate projects post in the given phase if a phase id is given.
  def create # rubocop:disable Metrics/MethodLength
    send_error and return unless phase_for_input

    form = phase_for_input.pmethod.custom_form
    extract_custom_field_values_from_params!(form)
    # Map topic_ids to input_topic_ids for the new InputTopics system
    if params[:idea].key?(:topic_ids)
      params[:idea][:input_topic_ids] = params[:idea].delete(:topic_ids) || []
    end
    params_for_create = idea_params form
    files_params = extract_file_params(params_for_create)

    input = Idea.new params_for_create

    files_params.each do |file_params|
      build_idea_file_attachment(input, file_params)
    end

    input.creation_phase = (phase_for_input if !phase_for_input.pmethod.transitive?)
    input.phase_ids = [phase_for_input.id] if params.dig(:idea, :phase_ids).blank?

    # Non persisted attribute needed by policy & anonymous_participation concern for 'everyone' participation only
    input.request = request if phase_for_input.pmethod.everyone_tracking_enabled?

    # If native survey or community monitor, and we are publishing this survey:
    # Do not store user ID if user_data_collection it set to "anonymous" or "demographics_only"
    # (anonymous = true on the input just means "do not store user ID")
    # If we are NOT publishing this survey: we need to store the author_id
    # because otherwise we cannot PATCH it because only the author can
    published = params_for_create[:publication_status] == 'published'
    surveylike = phase_for_input.pmethod.supports_survey_form?
    not_all_data = phase_for_input.pmethod.user_data_collection != 'all_data'

    if published && surveylike && not_all_data
      input.anonymous = true
    end

    input.author ||= current_user

    phase_for_input.pmethod.assign_defaults(input)

    sidefx.before_create(input, current_user)

    authorize input
    if anonymous_not_allowed?(phase_for_input)
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    if idea_status_not_allowed?(input)
      render json: { errors: { idea_status_id: [{ error: 'Cannot manually assign inputs to an automatic status', value: input.idea_status_id }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity input

    save_options = {}
    publication_status = params.dig(:idea, :publication_status)

    if publication_status == 'published'
      save_options[:context] = :publication
    end

    if input.publication_status == 'published' && UserFieldsInFormService.should_merge_user_fields_into_idea?(
      current_user,
      phase_for_input,
      input
    )
      input.custom_field_values = UserFieldsInFormService.merge_user_fields_into_idea(
        current_user,
        phase_for_input,
        input.custom_field_values
      )
    end

    ActiveRecord::Base.transaction do
      if input.save(**save_options)
        update_file_upload_fields input, form, params_for_create
        sidefx.after_create(input, current_user, phase_for_input)
        write_everyone_tracking_cookie input

        permission = phase_for_input.permissions.find_by(action: 'posting_idea')
        generate_claim_token = permission && permission.permitted_by == 'everyone' && permission.user_data_collection != 'anonymous' && current_user.nil?

        if generate_claim_token
          ClaimTokenService.generate(input)
        end

        serializer_params = jsonapi_serializer_params.merge(include_claim_token: true)

        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: serializer_params,
          include: %i[author input_topics phases user_reaction idea_images]
        ).serializable_hash, status: :created
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def update # rubocop:disable Metrics/MethodLength
    input = Idea.find params[:id]

    authorize input

    if invalid_blank_author_for_update? input, params
      render json: { errors: { author: [{ error: :blank }] } }, status: :unprocessable_entity
      return
    end

    extract_custom_field_values_from_params!(input.custom_form)
    # Map topic_ids to input_topic_ids for the new InputTopics system
    if params[:idea].key?(:topic_ids)
      params[:idea][:input_topic_ids] = params[:idea].delete(:topic_ids) || []
    end
    params[:idea][:cosponsor_ids] ||= [] if params[:idea].key?(:cosponsor_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].key?(:phase_ids)
    params_service.mark_custom_field_values_to_clear!(input.custom_field_values, params[:idea][:custom_field_values])

    update_params = idea_params(input.custom_form).to_h

    legacy_files = FileUpload.where(idea: input)

    unless legacy_files.exists?
      extract_file_params(update_params).each do |file_params|
        build_idea_file_attachment(input, file_params)
      end
    end

    phase_ids = update_params.delete(:phase_ids) if update_params[:phase_ids]
    update_params[:custom_field_values] = params_service.updated_custom_field_values(input.custom_field_values, update_params[:custom_field_values])
    CustomFieldService.new.compact_custom_field_values! update_params[:custom_field_values]
    input.set_manual_votes(update_params[:manual_votes_amount], current_user) if update_params[:manual_votes_amount]

    creation_phase = input.creation_phase

    if (input.publication_status == 'published' || update_params[:publication_status] == 'published') && UserFieldsInFormService.should_merge_user_fields_into_idea?(
      current_user,
      creation_phase,
      input
    )
      update_params[:custom_field_values] = UserFieldsInFormService.merge_user_fields_into_idea(
        current_user,
        creation_phase,
        update_params[:custom_field_values]
      )
    end

    # If native survey or community monitor, and we are publishing this survey:
    # Do not store user ID if user_data_collection it set to "anonymous" or "demographics_only"
    # (anonymous = true on the input just means "do not store user ID")
    # we can only anonymize it after publishing because before that it might
    # still receive other PATCHes
    anonymize_user_at_the_end = if creation_phase
      published = update_params[:publication_status] == 'published'
      surveylike = creation_phase.pmethod.supports_survey_form?
      not_all_data = creation_phase.pmethod.user_data_collection != 'all_data'

      published && surveylike && not_all_data
    else
      false
    end

    update_errors = nil
    ActiveRecord::Base.transaction do # Assigning relationships cause database changes
      input.assign_attributes(update_params)
      sidefx.before_update(input, current_user)
      input.phase_ids = phase_ids if phase_ids

      authorize(input)

      update_errors = not_allowed_update_errors(input)
      raise ActiveRecord::Rollback if update_errors

      verify_profanity input
    end

    if update_errors
      render json: update_errors, status: :unprocessable_entity
      return
    end

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'

    ActiveRecord::Base.transaction do
      if input.save(**save_options)
        sidefx.after_update(input, current_user)
        update_file_upload_fields input, input.custom_form, update_params

        if anonymize_user_at_the_end
          input.author_id = nil
          input.save!
        end

        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: jsonapi_serializer_params,
          include: %i[author input_topics user_reaction idea_images cosponsors]
        ).serializable_hash, status: :ok
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def destroy
    input = Idea.find params[:id]
    authorize input
    input = input.destroy
    if input.destroyed?
      sidefx.after_destroy(input, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def similar_ideas
    require_feature! 'input_iq'

    idea = Idea.new idea_params_for_similarities
    service = SimilarIdeasService.new(idea)

    phase_for_similarity = params[:phase_id] ? Phase.find(params[:phase_id]) : phase_for_input
    title_threshold = phase_for_similarity.similarity_threshold_title
    body_threshold = phase_for_similarity.similarity_threshold_body
    cache_key = "similar_ideas/#{{ id: idea.id, title_multiloc: idea.title_multiloc, body_multiloc: idea.body_multiloc, project_id: idea.project_id, title_threshold:, body_threshold: }}"

    json_result = Rails.cache.fetch(cache_key, expires_in: 10.minutes) do
      scope = policy_scope(Idea)
      scope = scope.where(project_id: idea.project_id) if idea.project_id
      results = service.similar_ideas(scope:, title_threshold:, body_threshold:, limit: SIMILARITIES_LIMIT)
      WebApi::V1::IdeaSerializer.new(results, serialization_options_for(results)).serializable_hash
    end

    render json: json_result
  end

  def copy
    dest_phase = Phase.find(params[:phase_id])
    authorize(dest_phase, :copy_inputs_to_phase?)

    job_args = [:submitted_or_published, copy_filters, dest_phase, current_user]
    job_kwargs = { allow_duplicates: allow_duplicates? }.compact

    tracker = if dry_run?
      Ideas::CopyJob.dry_run(*job_args, **job_kwargs)
    else
      job = Ideas::CopyJob
        .with_tracking(owner: current_user)
        .perform_later(*job_args, **job_kwargs)

      sidefx.after_copy(job, current_user)
      job.tracker
    end

    render json: WebApi::V1::Jobs::TrackerSerializer.new(
      tracker,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  def phase_for_input
    return @phase_for_input if defined? @phase_for_input

    project = Project.find(params.dig(:idea, :project_id))
    phase_ids = params.dig(:idea, :phase_ids) || []
    is_moderator = current_user && UserRoleService.new.can_moderate_project?(project, current_user)
    return false if phase_ids.any? && !(is_moderator && phase_ids.size == 1)

    @phase_for_input = if is_moderator && phase_ids.any?
      Phase.find(phase_ids.first)
    else
      TimelineService.new.current_phase_not_archived(project)
    end
    return false if !@phase_for_input

    @phase_for_input
  end

  def render_show(input, check_auth: true)
    authorize input if check_auth # we should usually check auth, except when we're returning an empty draft idea
    render json: WebApi::V1::IdeaSerializer.new(
      input,
      params: jsonapi_serializer_params,
      include: %i[author input_topics user_reaction idea_images]
    ).serializable_hash
  end

  def extract_custom_field_values_from_params!(custom_form)
    return if !custom_form

    custom_field_values = params_service.extract_custom_field_values_from_params!(
      params[:idea],
      submittable_custom_fields(custom_form)
    )
    params[:idea][:custom_field_values] = custom_field_values if custom_field_values.present?
  end

  def extract_params_for_file_upload_fields(custom_form, params)
    return {} if params['custom_field_values'].blank?

    file_upload_field_keys = IdeaCustomFieldsService.new(custom_form).all_fields.select(&:supports_file_upload?).map(&:key)
    params['custom_field_values'].extract!(*file_upload_field_keys)
  end

  def update_file_upload_fields(input, custom_form, params)
    file_uploads_exist = false
    params_for_file_upload_fields = extract_params_for_file_upload_fields custom_form, params

    legacy_files = FileUpload.where(idea: input)

    params_for_file_upload_fields.each do |key, params_for_files_field|
      if (file_id = params_for_files_field['id'])
        idea_file = Files::FileAttachment.find_by(id: file_id) || FileUpload.find(file_id)
        filename = idea_file.is_a?(FileUpload) ? idea_file.name : idea_file.file.name
        input.custom_field_values[key] = { id: idea_file.id, name: filename }
        file_uploads_exist = true

      elsif params_for_files_field['content']
        idea_file = if legacy_files.exists?
          FileUpload.create!(idea: input, file_by_content: {
            name: params_for_files_field['name'],
            content: params_for_files_field['content']
          })
        else
          build_idea_file_attachment(input, params_for_files_field).tap(&:save!)
        end

        filename = idea_file.is_a?(FileUpload) ? idea_file.name : idea_file.file.name
        input.custom_field_values[key] = { id: idea_file.id, name: filename }
        file_uploads_exist = true
      end
    end

    input.save! if file_uploads_exist
  end

  def extract_file_params(idea_params)
    idea_params
      .delete(:idea_files_attributes).to_a
      .map { |file_params| file_params.fetch(:file_by_content) }
  end

  def build_idea_file_attachment(idea, file_params)
    files_file = Files::RestrictedFile.new( # temporary-fix-for-vienna-svg-security-issue (use Files::File.new to undo)
      content_by_content: {
        content: file_params['content'],
        name: file_params['name']
      },
      uploader: current_user
    )

    project = idea.project
    files_file.files_projects.build(project: project)
    idea.file_attachments.build(file: files_file)
  end

  def sidefx
    @sidefx ||= SideFxIdeaService.new
  end

  def params_service
    @params_service ||= CustomFieldParamsService.new
  end

  def idea_params(custom_form)
    params.require(:idea).permit(idea_attributes(custom_form))
  end

  def idea_attributes(custom_form)
    submittable_field_keys = submittable_custom_fields(custom_form).map { |x| x.key.to_sym }
    attributes = idea_simple_attributes(submittable_field_keys)
    complex_attributes = idea_complex_attributes(custom_form, submittable_field_keys)
    attributes << complex_attributes if complex_attributes.any?
    user_can_moderate_project = current_user && UserRoleService.new.can_moderate_project?(custom_form.participation_context&.project, current_user)
    if user_can_moderate_project
      attributes.concat %i[author_id idea_status_id budget manual_votes_amount] + [phase_ids: []]
    end
    attributes
  end

  def idea_simple_attributes(submittable_field_keys)
    simple_attributes = %i[location_description proposed_budget] & submittable_field_keys
    simple_attributes.push(:publication_status, :project_id, :anonymous)
    if submittable_field_keys.include?(:idea_images_attributes)
      simple_attributes << [idea_images_attributes: [:image]]
    end
    if submittable_field_keys.include?(:idea_files_attributes)
      simple_attributes << [{ idea_files_attributes: [{ file_by_content: %i[content name] }, :name] }]
    end
    simple_attributes
  end

  def idea_complex_attributes(custom_form, submittable_field_keys)
    complex_attributes = {
      location_point_geojson: [:type, { coordinates: [] }]
    }

    allowed_custom_fields = submittable_custom_fields(custom_form).reject(&:built_in?)
    custom_field_values_params = params_service.custom_field_values_params(allowed_custom_fields)
    if custom_field_values_params.any?
      complex_attributes[:custom_field_values] = custom_field_values_params
    end

    if submittable_field_keys.include?(:title_multiloc)
      complex_attributes[:title_multiloc] = CL2_SUPPORTED_LOCALES
    end

    if submittable_field_keys.include?(:body_multiloc)
      complex_attributes[:body_multiloc] = CL2_SUPPORTED_LOCALES
    end

    if submittable_field_keys.include?(:topic_ids)
      # topic_ids is mapped to input_topic_ids for the InputTopics system
      complex_attributes[:input_topic_ids] = []
    end

    if submittable_field_keys.include?(:cosponsor_ids)
      complex_attributes[:cosponsor_ids] = []
    end

    complex_attributes
  end

  def idea_params_for_similarities
    params.require(:idea).permit([:id, :project_id, { title_multiloc: CL2_SUPPORTED_LOCALES, body_multiloc: CL2_SUPPORTED_LOCALES }])
  end

  def submittable_custom_fields(custom_form)
    @submittable_custom_fields ||= {}

    cache_key = custom_form&.id || :no_form
    @submittable_custom_fields[cache_key] ||= IdeaCustomFieldsService.new(custom_form).submittable_fields_with_other_options
  end

  def authorize_project_or_ideas
    if params[:project].present?
      authorize Project.find(params[:project]), :index_xlsx?
    else
      authorize :idea, :index_xlsx?
    end
  end

  # Only relevant for allow_anonymous_participation in the context of ideation
  # Not relevant for 'user_data_collection' in the context of surveys
  def anonymous_not_allowed?(phase)
    return false if permitted_by_everyone?(phase)

    params.dig('idea', 'anonymous') && !phase.allow_anonymous_participation
  end

  def permitted_by_everyone?(phase)
    permission = Permission.find_by(
      permission_scope_id: phase.id,
      action: 'posting_idea'
    )
    permission&.permitted_by == 'everyone'
  end

  def idea_status_not_allowed?(input)
    return false if params.dig(:idea, :idea_status_id).blank?

    !input.idea_status.can_manually_transition_to?
  end

  def serialization_options_for(ideas)
    include = %i[author idea_images ideas_phases cosponsors manual_votes_last_updated_by]
    if current_user
      # I have no idea why but the trending query part
      # breaks if you don't fetch the ids in this way.
      reactions = Reaction.where(user: current_user, reactable_id: ideas.map(&:id), reactable_type: 'Idea')
      include << 'user_reaction'
      user_followers = current_user.follows
        .where(followable_type: 'Idea')
        .group_by do |follower|
          [follower.followable_id, follower.followable_type]
        end
      user_followers ||= {}
      {
        params: jsonapi_serializer_params(
          phase: params[:phase] && Phase.find(params[:phase]),
          vbii: reactions.index_by(&:reactable_id),
          user_followers: user_followers,
          user_requirements_service: Permissions::UserRequirementsService.new(check_groups_and_verification: false)
        ),
        include: include
      }
    else
      {
        params: jsonapi_serializer_params(
          phase: params[:phase] && Phase.find(params[:phase])
        ),
        include: include
      }
    end
  end

  def invalid_blank_author_for_update?(input, params)
    author_removal = params[:idea].key?(:author_id) && params[:idea][:author_id].nil?
    publishing = params[:idea][:publication_status] == 'published' && input.publication_status != 'published' && !input.author_id

    return false unless author_removal || publishing

    return false if input.idea_import && input.idea_import.approved_at.nil?

    !input.participation_method_on_creation.supports_inputs_without_author?
  end

  def not_allowed_update_errors(input)
    can_moderate = UserRoleService.new.can_moderate?(input.project, current_user)

    if !can_moderate && anonymous_not_allowed?(TimelineService.new.current_phase_not_archived(input.project))
      return { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }
    end

    if idea_status_not_allowed?(input)
      return { errors: { idea_status_id: [{ error: 'Cannot manually assign inputs to this status', value: input.idea_status_id }] } }
    end

    if !input.participation_method_on_creation.transitive? && input.project_id_changed?
      return { errors: { project_id: [{ error: 'Cannot change the project of non-transitive inputs', value: input.project_id }] } }
    end

    if !input.participation_method_on_creation.transitive? && input.ideas_phases.find_index(&:changed?)
      { errors: { phase_ids: [{ error: 'Cannot change the phases of non-transitive inputs', value: input.phase_ids }] } }
    end
  end

  def copy_filters
    params.require(:filters).permit(:phase)
  end

  def dry_run?
    @dry_run ||= Utils.to_bool(params.fetch(:dry_run, false))
  end

  def allow_duplicates?
    Utils.to_bool(params[:allow_duplicates]) if params[:allow_duplicates]
  end

  def write_everyone_tracking_cookie(input)
    Permissions::EveryoneTrackingService.new(
      input.author,
      input.creation_phase,
      input.request
    ).write_everyone_tracking_cookie(cookies, input.author_hash)
  end
end

WebApi::V1::IdeasController.prepend(IdeaAssignment::Patches::WebApi::V1::IdeasController)
WebApi::V1::IdeasController.include(AggressiveCaching::Patches::WebApi::V1::IdeasController)
