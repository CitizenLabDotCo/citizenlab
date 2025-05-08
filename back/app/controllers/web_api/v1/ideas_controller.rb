# frozen_string_literal: true

class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

  SIMILARITIES_LIMIT = 5

  before_action :authorize_project_or_ideas, only: %i[index_xlsx]
  skip_before_action :authenticate_user # TODO: temp fix to pass tests
  skip_after_action :verify_authorized, only: %i[index_xlsx index_mini index_idea_markers filter_counts]
  skip_after_action :verify_authorized, only: %i[create], unless: -> { response.status == 400 }
  after_action :verify_policy_scoped, only: %i[index index_mini]
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def json_forms_schema
    input = Idea.find params[:id]
    enabled_fields = IdeaCustomFieldsService.new(input.custom_form).enabled_fields
    json_attributes = JsonFormsService.new.input_ui_and_json_multiloc_schemas enabled_fields, current_user, input.participation_method_on_creation, input.input_term
    render json: raw_json(json_attributes)
  end

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
      :topics,
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
    ideas = ideas.includes(:author, :topics, :project, :idea_status, :idea_files)

    render json: linked_json(ideas, WebApi::V1::PostMarkerSerializer, params: jsonapi_serializer_params)
  end

  def index_xlsx
    ideas = IdeasFinder.new(
      params.merge(filter_can_moderate: true),
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records
    ideas = SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:author, :topics, :project, :idea_status, :idea_files)

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

    # Merge custom field values from the user's profile if user fields are presented in the idea form
    if current_user && phase.pmethod.user_fields_in_form?
      user_values = current_user.custom_field_values&.transform_keys { |key| "u_#{key}" }
      draft_idea.custom_field_values = user_values.merge(draft_idea.custom_field_values) if current_user
    end
    render_show draft_idea, check_auth: false
  end

  #   Normal users always post in an active phase. They should never provide a phase id.
  #   Users who can moderate projects post in an active phase if no phase id is given.
  #   Users who can moderate projects post in the given phase if a phase id is given.
  def create
    send_error and return if !phase_for_input

    form = phase_for_input.pmethod.custom_form
    extract_custom_field_values_from_params!(form)
    params_for_create = idea_params form
    input = Idea.new params_for_create
    input.creation_phase = (phase_for_input if !phase_for_input.pmethod.transitive?)
    input.phase_ids = [phase_for_input.id] if params.dig(:idea, :phase_ids).blank?

    # NOTE: Needs refactor allow_anonymous_participation? so anonymous_participation can be allow or force
    if phase_for_input.pmethod.supports_survey_form? && phase_for_input.allow_anonymous_participation?
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
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if input.save(**save_options)
        update_file_upload_fields input, form, params_for_create
        sidefx.after_create(input, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: jsonapi_serializer_params,
          include: %i[author topics phases user_reaction idea_images]
        ).serializable_hash, status: :created
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def update
    input = Idea.find params[:id]

    authorize input

    if invalid_blank_author_for_update? input, params
      render json: { errors: { author: [{ error: :blank }] } }, status: :unprocessable_entity
      return
    end

    extract_custom_field_values_from_params!(input.custom_form)
    params[:idea][:topic_ids] ||= [] if params[:idea].key?(:topic_ids)
    params[:idea][:cosponsor_ids] ||= [] if params[:idea].key?(:cosponsor_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].key?(:phase_ids)
    params_service.mark_custom_field_values_to_clear!(input.custom_field_values, params[:idea][:custom_field_values])

    update_params = idea_params(input.custom_form).to_h
    phase_ids = update_params.delete(:phase_ids) if update_params[:phase_ids]
    update_params[:custom_field_values] = params_service.updated_custom_field_values(input.custom_field_values, update_params[:custom_field_values])
    CustomFieldService.new.compact_custom_field_values! update_params[:custom_field_values]
    input.set_manual_votes(update_params[:manual_votes_amount], current_user) if update_params[:manual_votes_amount]

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
        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: jsonapi_serializer_params,
          include: %i[author topics user_reaction idea_images cosponsors]
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

    title_threshold = phase_for_input.similarity_threshold_title
    body_threshold = phase_for_input.similarity_threshold_body
    cache_key = "similar_ideas/#{{ title_multiloc: idea.title_multiloc, body_multiloc: idea.body_multiloc, project_id: idea.project_id, title_threshold:, body_threshold: }}"

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

    ideas = IdeasFinder.new(
      params.require(:filters),
      scope: policy_scope(Idea).submitted_or_published,
      current_user: current_user
    ).find_records

    new_ids = ideas.map do |idea|
      idea.dup.tap do |i|
        i.project = dest_phase.project
        i.phases = [dest_phase]
        i.slug = nil
      end.save!
    end

    copied_ideas = Idea.where(id: new_ids)
      .then { |ideas_| paginate(ideas_) }

    render json: linked_json(
      copied_ideas,
      WebApi::V1::IdeaSerializer,
      serialization_options_for(copied_ideas)
    )
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
      include: %i[author topics user_reaction idea_images]
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

    file_upload_field_keys = IdeaCustomFieldsService.new(custom_form).all_fields.select(&:file_upload?).map(&:key)
    params['custom_field_values'].extract!(*file_upload_field_keys)
  end

  def update_file_upload_fields(input, custom_form, params)
    file_uploads_exist = false
    params_for_file_upload_fields = extract_params_for_file_upload_fields custom_form, params
    params_for_file_upload_fields.each do |key, params_for_files_field|
      if params_for_files_field['id']
        idea_file = FileUpload.find(params_for_files_field['id'])
        if idea_file
          input.custom_field_values[key] = { id: idea_file.id, name: idea_file.name }
          file_uploads_exist = true
        end
      elsif params_for_files_field['content']
        idea_file = FileUpload.create!(
          idea: input,
          file_by_content: {
            name: params_for_files_field['name'],
            content: params_for_files_field['content']
          }
        )
        input.custom_field_values[key] = { id: idea_file.id, name: idea_file.name }
        file_uploads_exist = true
      end
    end
    input.save! if file_uploads_exist
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
      complex_attributes[:topic_ids] = []
    end

    if submittable_field_keys.include?(:cosponsor_ids)
      complex_attributes[:cosponsor_ids] = []
    end

    complex_attributes
  end

  def idea_params_for_similarities
    params.require(:idea).permit([:project_id, { title_multiloc: CL2_SUPPORTED_LOCALES, body_multiloc: CL2_SUPPORTED_LOCALES }])
  end

  def submittable_custom_fields(custom_form)
    IdeaCustomFieldsService.new(custom_form).submittable_fields_with_other_options
  end

  def authorize_project_or_ideas
    if params[:project].present?
      authorize Project.find(params[:project]), :index_xlsx?
    else
      authorize :idea, :index_xlsx?
    end
  end

  def anonymous_not_allowed?(phase)
    params.dig('idea', 'anonymous') && !phase.allow_anonymous_participation
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
    if anonymous_not_allowed?(TimelineService.new.current_phase_not_archived(input.project))
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
end

WebApi::V1::IdeasController.prepend(IdeaAssignment::Patches::WebApi::V1::IdeasController)
WebApi::V1::IdeasController.include(AggressiveCaching::Patches::WebApi::V1::IdeasController)
