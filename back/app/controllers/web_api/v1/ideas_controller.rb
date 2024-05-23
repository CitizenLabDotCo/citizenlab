# frozen_string_literal: true

class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

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
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user
    ).find_records

    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)

    # Only include after pagination - so we only get associations we need
    ideas = ideas.includes(
      :idea_images,
      :idea_trending_info,
      :topics,
      :phases,
      {
        project: [:phases, { phases: { permissions: [:groups] } }, { custom_form: [:custom_fields] }],
        author: [:unread_notifications]
      }
    )
    ideas = ideas.includes(:idea_import) unless current_user&.normal_user? # defined through BulkImportIdeas engine

    ideas = convert_phase_voting_counts ideas, params

    render json: linked_json(ideas, WebApi::V1::IdeaSerializer, serialization_options_for(ideas))
  end

  def index_mini
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user
    ).find_records
    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:idea_trending_info)

    render json: linked_json(ideas, WebApi::V1::IdeaMiniSerializer, params: jsonapi_serializer_params)
  end

  def index_idea_markers
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user
    ).find_records
    ideas = paginate SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:author, :topics, :project, :idea_status, :idea_files)

    render json: linked_json(ideas, WebApi::V1::PostMarkerSerializer, params: jsonapi_serializer_params)
  end

  def index_xlsx
    ideas = IdeasFinder.new(
      params.merge(filter_can_moderate: true),
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user
    ).find_records
    ideas = SortByParamsService.new.sort_ideas(ideas, params, current_user)
    ideas = ideas.includes(:author, :topics, :project, :idea_status, :idea_files)

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx ideas, view_private_attributes: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def filter_counts
    all_ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea),
      current_user: current_user
    ).find_records
    all_ideas = paginate SortByParamsService.new.sort_ideas(all_ideas, params, current_user)
    all_ideas = all_ideas.includes(:idea_trending_info)
    counts = {
      'idea_status_id' => {},
      'topic_id' => {}
    }
    attributes = %w[idea_status_id topic_id]
    all_ideas.published
      .joins('FULL OUTER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
      .select('idea_status_id, ideas_topics.topic_id, COUNT(DISTINCT(ideas.id)) as count')
      .reorder(nil) # Avoids SQL error on GROUP BY when a search string was used
      .group('GROUPING SETS (idea_status_id, ideas_topics.topic_id)')
      .each do |record|
      attributes.each do |attribute|
        id = record.send attribute
        counts[attribute][id] = record.count if id
      end
    end
    counts['total'] = all_ideas.count
    render json: raw_json(counts)
  end

  def show
    render_show Idea.find params[:id]
  end

  def by_slug
    render_show Idea.find_by!(slug: params[:slug])
  end

  # Return a single draft idea for a phase - for native survey autosave
  def draft_by_phase
    render_show Idea.find_by!(creation_phase_id: params[:phase_id], author: current_user, publication_status: 'draft')
  end

  #   Normal users always post in an active phase. They should never provide a phase id.
  #   Users who can moderate projects post in an active phase if no phase id is given.
  #   Users who can moderate projects post in the given phase if a phase id is given.
  def create
    project = Project.find(params.dig(:idea, :project_id))
    phase_ids = params.dig(:idea, :phase_ids) || []
    is_moderator = current_user && UserRoleService.new.can_moderate_project?(project, current_user)

    if phase_ids.any?
      send_error and return unless is_moderator

      send_error and return if phase_ids.size != 1
    end

    phase = if is_moderator && phase_ids.any?
      Phase.find(phase_ids.first)
    else
      TimelineService.new.current_phase_not_archived(project)
    end
    send_error and return unless phase

    participation_method = Factory.instance.participation_method_for(phase)
    extract_custom_field_values_from_params!(participation_method.custom_form)
    params_for_create = idea_params participation_method.custom_form, is_moderator
    input = Idea.new params_for_create
    input.creation_phase = (phase if participation_method.creation_phase?)
    input.phase_ids = [phase.id] if phase_ids.empty?

    # NOTE: Needs refactor allow_anonymous_participation? so anonymous_participation can be allow or force
    if phase.native_survey? && phase.allow_anonymous_participation?
      input.anonymous = true
    end
    input.author ||= current_user
    sidefx.before_create(input, current_user)

    authorize input
    if anonymous_not_allowed?(phase)
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity input

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if input.save(**save_options)
        update_file_upload_fields input, participation_method.custom_form, params_for_create
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
    project = input.project
    phase = TimelineService.new.current_phase_not_archived project
    authorize input

    if invalid_blank_author_for_update? input, params
      render json: { errors: { author: [{ error: :blank }] } }, status: :unprocessable_entity
      return
    end

    extract_custom_field_values_from_params!(input.custom_form)
    params[:idea][:topic_ids] ||= [] if params[:idea].key?(:topic_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].key?(:phase_ids)
    params_service.mark_custom_field_values_to_clear!(input.custom_field_values, params[:idea][:custom_field_values])

    user_can_moderate_project = UserRoleService.new.can_moderate_project?(project, current_user)
    update_params = idea_params(input.custom_form, user_can_moderate_project).to_h
    update_params[:custom_field_values] = params_service.updated_custom_field_values(input.custom_field_values, update_params[:custom_field_values])
    CustomFieldService.new.compact_custom_field_values! update_params[:custom_field_values]
    input.assign_attributes update_params
    authorize input
    if anonymous_not_allowed?(phase)
      render json: { errors: { base: [{ error: :anonymous_participation_not_allowed }] } }, status: :unprocessable_entity
      return
    end
    verify_profanity input

    sidefx.before_update(input, current_user)

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if input.save(**save_options)
        sidefx.after_update(input, current_user)
        update_file_upload_fields input, input.custom_form, update_params
        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: jsonapi_serializer_params,
          include: %i[author topics user_reaction idea_images]
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

  private

  def render_show(input)
    authorize input
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

  def idea_params(custom_form, user_can_moderate_project)
    params.require(:idea).permit(idea_attributes(custom_form, user_can_moderate_project))
  end

  def idea_attributes(custom_form, user_can_moderate_project)
    submittable_field_keys = submittable_custom_fields(custom_form).map(&:key).map(&:to_sym)
    attributes = idea_simple_attributes(submittable_field_keys)
    complex_attributes = idea_complex_attributes(custom_form, submittable_field_keys)
    attributes << complex_attributes if complex_attributes.any?
    if user_can_moderate_project
      attributes.concat %i[author_id idea_status_id budget] + [phase_ids: []]
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

    complex_attributes
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

  def serialization_options_for(ideas)
    include = %i[author idea_images ideas_phases]
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
          vbii: reactions.index_by(&:reactable_id),
          user_followers: user_followers,
          permission_service: Permissions::IdeaPermissionsService.new
        ),
        include: include
      }
    else
      {
        params: jsonapi_serializer_params,
        include: include
      }
    end
  end

  def invalid_blank_author_for_update?(input, params)
    author_removal = params[:idea].key?(:author_id) && params[:idea][:author_id].nil?
    publishing = params[:idea][:publication_status] == 'published' && input.publication_status != 'published' && !input.author_id

    return false unless author_removal || publishing

    return false if input.idea_import && input.idea_import.approved_at.nil?

    input.participation_method_on_creation.sign_in_required_for_posting?
  end

  # Change counts on idea for values for phase, if filtered by phase
  def convert_phase_voting_counts(ideas, params)
    if params[:phase]
      phase_id = params[:phase]
      ideas.map do |idea|
        next if idea.baskets_count == 0

        idea.ideas_phases.each do |ideas_phase|
          if ideas_phase.phase_id == phase_id
            idea.baskets_count = ideas_phase.baskets_count
            idea.votes_count = ideas_phase.votes_count
          end
        end
      end
    end
    ideas
  end
end

WebApi::V1::IdeasController.prepend(IdeaAssignment::Patches::WebApi::V1::IdeasController)
