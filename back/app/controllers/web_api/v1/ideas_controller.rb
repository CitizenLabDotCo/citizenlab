# frozen_string_literal: true

class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

  before_action :set_idea, only: %i[show update destroy]
  before_action :authorize_project_or_ideas, only: %i[index_xlsx]
  skip_before_action :authenticate_user # TODO: temp fix to pass tests
  skip_after_action :verify_authorized, only: %i[index_xlsx index_mini index_idea_markers filter_counts]
  after_action :verify_policy_scoped, only: %i[index index_mini]
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

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
    render json: WebApi::V1::IdeaSerializer.new(
      @idea,
      params: fastjson_params,
      include: %i[author topics user_vote idea_images]
    ).serialized_json
  end

  def by_slug
    @idea = Idea.find_by!(slug: params[:slug])
    authorize @idea
    show
  end

  # insert
  def create
    service = SideFxIdeaService.new

    if params[:idea][:custom_field_values]
      CustomFieldService.new.cleanup_custom_field_values! params[:idea][:custom_field_values]
    end

    @idea = Idea.new idea_params
    @idea.author ||= current_user
    service.before_create(@idea, current_user)

    authorize @idea
    verify_profanity @idea

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if @idea.save save_options
        service.after_create(@idea, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          @idea.reload,
          params: fastjson_params,
          include: %i[author topics phases user_vote idea_images]
        ).serialized_json, status: :created
      else
        render json: { errors: @idea.errors.details }, status: :unprocessable_entity
      end
    end
  end

  # patch
  def update
    service = SideFxIdeaService.new

    params[:idea][:topic_ids] ||= [] if params[:idea].key?(:topic_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].key?(:phase_ids)

    mark_custom_field_values_to_clear!

    update_params = idea_params.to_h
    update_params[:custom_field_values] = @idea.custom_field_values.merge(update_params[:custom_field_values] || {})
    CustomFieldService.new.cleanup_custom_field_values! update_params[:custom_field_values]
    @idea.assign_attributes update_params
    authorize @idea
    verify_profanity @idea

    service.before_update(@idea, current_user)

    save_options = {}
    save_options[:context] = :publication if params.dig(:idea, :publication_status) == 'published'
    ActiveRecord::Base.transaction do
      if @idea.save save_options
        authorize @idea
        service.after_update(@idea, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          @idea.reload,
          params: fastjson_params,
          include: %i[author topics user_vote idea_images]
        ).serialized_json, status: :ok
      else
        render json: { errors: @idea.errors.details }, status: :unprocessable_entity
      end
    end
  end

  # delete
  def destroy
    service = SideFxIdeaService.new

    service.before_destroy(@idea, current_user)
    idea = @idea.destroy
    if idea.destroyed?
      service.after_destroy(idea, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_idea
    @idea = Idea.find params[:id]
    authorize @idea
  end

  def idea_attributes
    project = @idea&.project || Project.find(params.dig(:idea, :project_id))
    custom_form = project.custom_form || CustomForm.new(project: project)
    enabled_field_keys = IdeaCustomFieldsService.new(custom_form).enabled_fields.map { |field| field.key.to_sym }

    attributes = idea_simple_attributes(enabled_field_keys)
    complex_attributes = idea_complex_attributes(custom_form, enabled_field_keys)
    attributes << complex_attributes if complex_attributes.any?
    if UserRoleService.new.can_moderate_project?(project, current_user)
      attributes.concat %i[idea_status_id budget] + [phase_ids: []]
    end
    attributes
  end

  def idea_simple_attributes(enabled_field_keys)
    simple_attributes = %i[location_description proposed_budged] & enabled_field_keys
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

  def idea_params
    params.require(:idea).permit(idea_attributes)
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

  def mark_custom_field_values_to_clear!
    # We need to explicitly mark which custom field values
    # should be cleared so we can distinguish those from
    # the custom field value updates cleared out by the
    # policy (which should stay like before instead of
    # being cleared out).
    return unless @idea&.custom_field_values.present? && params[:idea][:custom_field_values].present?

    (@idea.custom_field_values.keys - (params[:idea][:custom_field_values].keys || [])).each do |clear_key|
      params[:idea][:custom_field_values][clear_key] = nil
    end
  end
end

::WebApi::V1::IdeasController.prepend_if_ee 'IdeaAssignment::Patches::WebApi::V1::IdeasController'
