# frozen_string_literal: true

class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

  before_action :authorize_project_or_ideas, only: %i[index_xlsx]
  skip_before_action :authenticate_user # TODO: temp fix to pass tests
  skip_after_action :verify_authorized, only: %i[index_xlsx index_mini index_idea_markers filter_counts]
  skip_after_action :verify_authorized, only: %i[create], unless: -> { response.status == 400 }
  after_action :verify_policy_scoped, only: %i[index index_mini]
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def schema
    input = Idea.find params[:id]
    enabled_fields = IdeaCustomFieldsService.new(input.custom_form).enabled_fields
    render json: CustomFieldService.new.ui_and_json_multiloc_schemas(AppConfiguration.instance, enabled_fields)
  end

  def json_forms_schema
    input = Idea.find params[:id]
    enabled_fields = IdeaCustomFieldsService.new(input.custom_form).enabled_fields
    render json: JsonFormsService.new.input_ui_and_json_multiloc_schemas(enabled_fields, current_user, input.input_term)
  end

  def index
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: [
        :idea_images, :idea_trending_info,
        {
          project: [:phases, :permissions, { custom_form: [:custom_fields] }],
          phases: [:permissions],
          author: [:unread_notifications]
        }
      ]
    ).find_records

    render json: linked_json(ideas, WebApi::V1::IdeaSerializer, serialization_options_for(ideas))
  end

  def index_mini
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[idea_trending_info]
    ).find_records

    render json: linked_json(ideas, WebApi::V1::IdeaMiniSerializer, params: fastjson_params(pcs: ParticipationContextService.new))
  end

  def index_idea_markers
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[author topics project idea_status idea_files]
    ).find_records

    render json: linked_json(ideas, WebApi::V1::PostMarkerSerializer, params: fastjson_params)
  end

  def index_xlsx
    ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[author topics project idea_status idea_files],
      paginate: false
    ).find_records

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx ideas, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def filter_counts
    all_ideas = IdeasFinder.new(
      params,
      scope: policy_scope(Idea),
      current_user: current_user,
      includes: %i[idea_trending_info]
    ).find_records
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
    render json: counts
  end

  def show
    render_show Idea.find params[:id]
  end

  def by_slug
    render_show Idea.find_by!(slug: params[:slug])
  end

  # For continuous projects:
  #   Providing a phase id yields a bad request.
  # For timeline projects:
  #   Normal users always post in an active phase. They should never provide a phase id.
  #   Users who can moderate projects post in an active phase if no phase id is given.
  #   Users who can moderate projects post in the given phase if a phase id is given.
  def create
    project = Project.find(params.dig(:idea, :project_id))
    phase_ids = params.dig(:idea, :phase_ids) || []
    is_moderator = current_user && UserRoleService.new.can_moderate_project?(project, current_user)

    if phase_ids.any?
      send_error and return unless is_moderator
      send_error and return if project.continuous? || phase_ids.size != 1
    end

    participation_context = if is_moderator && phase_ids.any?
      Phase.find(phase_ids.first)
    else
      ParticipationContextService.new.get_participation_context(project)
    end
    send_error and return unless participation_context

    participation_method = Factory.instance.participation_method_for(participation_context)
    participation_context_for_form = participation_method.form_in_phase? ? participation_context : project
    custom_form = participation_context_for_form.custom_form || CustomForm.new(participation_context: participation_context_for_form)

    extract_custom_field_values_from_params! custom_form
    params_for_create = idea_params(custom_form, is_moderator)
    params_for_file_upload_fields = extract_params_for_file_upload_fields(custom_form, params_for_create)
    input = Idea.new params_for_create
    if project.timeline?
      input.creation_phase = (participation_context if participation_method.form_in_phase?)
      input.phase_ids = [participation_context.id] if phase_ids.empty?
    end
    input.author ||= current_user
    service.before_create(input, current_user)

    authorize input
    verify_profanity input

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if input.save save_options
        params_for_file_upload_fields.each do |key, params_for_files_field|
          idea_file = FileUpload.create!(
            idea: input,
            file_by_content: {
              name: params_for_files_field['name'],
              content: params_for_files_field['content']
            }
          )
          input.custom_field_values[key] = idea_file.id
        end
        input.save!
        service.after_create(input, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: fastjson_params,
          include: %i[author topics phases user_vote idea_images]
        ).serialized_json, status: :created
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def extract_params_for_file_upload_fields(custom_form, params_for_create)
    return {} if params_for_create['custom_field_values'].blank?

    file_upload_field_keys = IdeaCustomFieldsService.new(custom_form).all_fields.select(&:file_upload?).map(&:key)
    params_for_create['custom_field_values'].extract!(*file_upload_field_keys)
  end

  def update
    input = Idea.find params[:id]
    project = input.project
    authorize input

    if invalid_blank_author_for_update? input, params
      render json: { errors: { author: [{ error: :blank }] } }, status: :unprocessable_entity
      return
    end

    extract_custom_field_values_from_params! input.custom_form
    params[:idea][:topic_ids] ||= [] if params[:idea].key?(:topic_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].key?(:phase_ids)
    mark_custom_field_values_to_clear! input

    user_can_moderate_project = UserRoleService.new.can_moderate_project?(project, current_user)
    update_params = idea_params(input.custom_form, user_can_moderate_project).to_h
    update_params[:custom_field_values] = input.custom_field_values.merge(update_params[:custom_field_values] || {})
    CustomFieldService.new.cleanup_custom_field_values! update_params[:custom_field_values]
    input.assign_attributes update_params
    authorize input
    verify_profanity input

    service.before_update(input, current_user)

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if input.save save_options
        authorize input
        service.after_update(input, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          input.reload,
          params: fastjson_params,
          include: %i[author topics user_vote idea_images]
        ).serialized_json, status: :ok
      else
        render json: { errors: input.errors.details }, status: :unprocessable_entity
      end
    end
  end

  def destroy
    input = Idea.find params[:id]
    authorize input
    service.before_destroy(input, current_user)
    input = input.destroy
    if input.destroyed?
      service.after_destroy(input, current_user)
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
      params: fastjson_params,
      include: %i[author topics user_vote idea_images]
    ).serialized_json
  end

  def extract_custom_field_values_from_params!(custom_form)
    return unless custom_form

    all_fields = IdeaCustomFieldsService.new(custom_form).all_fields
    extra_field_values = all_fields.each_with_object({}) do |field, accu|
      next if field.built_in?

      given_value = params[:idea].delete field.key
      next unless given_value && field.enabled?

      accu[field.key] = given_value
    end
    return if extra_field_values.empty?

    params[:idea][:custom_field_values] = extra_field_values
  end

  def service
    @service ||= SideFxIdeaService.new
  end

  def idea_attributes(custom_form, user_can_moderate_project)
    enabled_field_keys = IdeaCustomFieldsService.new(custom_form).enabled_fields.map { |field| field.key.to_sym }
    attributes = idea_simple_attributes(enabled_field_keys)
    complex_attributes = idea_complex_attributes(custom_form, enabled_field_keys)
    attributes << complex_attributes if complex_attributes.any?
    if user_can_moderate_project
      attributes.concat %i[idea_status_id budget] + [phase_ids: []]
    end
    attributes
  end

  def idea_simple_attributes(enabled_field_keys)
    simple_attributes = %i[location_description proposed_budget] & enabled_field_keys
    simple_attributes.concat %i[publication_status project_id author_id]
    if enabled_field_keys.include?(:idea_images_attributes)
      simple_attributes << [idea_images_attributes: [:image]]
    end
    if enabled_field_keys.include?(:idea_files_attributes)
      simple_attributes << [{ idea_files_attributes: [{ file_by_content: %i[content name] }, :name] }]
    end
    simple_attributes
  end

  def idea_complex_attributes(custom_form, enabled_field_keys)
    complex_attributes = {
      location_point_geojson: [:type, { coordinates: [] }]
    }
    allowed_extra_field_keys = IdeaCustomFieldsService.new(custom_form).allowed_extra_field_keys
    if allowed_extra_field_keys.any?
      complex_attributes[:custom_field_values] = allowed_extra_field_keys
    end
    if enabled_field_keys.include?(:title_multiloc)
      complex_attributes[:title_multiloc] = CL2_SUPPORTED_LOCALES
    end
    if enabled_field_keys.include?(:body_multiloc)
      complex_attributes[:body_multiloc] = CL2_SUPPORTED_LOCALES
    end
    if enabled_field_keys.include?(:topic_ids)
      complex_attributes[:topic_ids] = []
    end
    complex_attributes
  end

  def idea_params(custom_form, user_can_moderate_project)
    params.require(:idea).permit(idea_attributes(custom_form, user_can_moderate_project))
  end

  def authorize_project_or_ideas
    if params[:project].present?
      authorize Project.find(params[:project]), :index_xlsx?
    else
      authorize :idea, :index_xlsx?
    end
  end

  def serialization_options_for(ideas)
    if current_user
      # I have no idea why but the trending query part
      # breaks if you don't fetch the ids in this way.
      votes = Vote.where(user: current_user, votable_id: ideas.map(&:id), votable_type: 'Idea')
      {
        params: fastjson_params(vbii: votes.index_by(&:votable_id), pcs: ParticipationContextService.new),
        include: %i[author user_vote idea_images]
      }
    else
      {
        params: fastjson_params(pcs: ParticipationContextService.new),
        include: %i[author idea_images]
      }
    end
  end

  def mark_custom_field_values_to_clear!(input)
    # We need to explicitly mark which custom field values
    # should be cleared so we can distinguish those from
    # the custom field value updates cleared out by the
    # policy (which should stay like before instead of
    # being cleared out).
    return unless input&.custom_field_values.present? && params[:idea][:custom_field_values].present?

    (input.custom_field_values.keys - (params[:idea][:custom_field_values].keys || [])).each do |clear_key|
      params[:idea][:custom_field_values][clear_key] = nil
    end
  end

  def invalid_blank_author_for_update?(input, params)
    author_removal = params[:idea].key?(:author_id) && params[:idea][:author_id].nil?
    publishing = params[:idea][:publication_status] == 'published'

    return false unless author_removal || (publishing && !input.author_id)

    input.participation_method_on_creation.sign_in_required_for_posting?
  end
end
