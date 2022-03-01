class WebApi::V1::IdeasController < ApplicationController
  include BlockingProfanity

  before_action :set_idea, only: %i[show update destroy]
  before_action :authorize_project_or_ideas, only: %i[index_xlsx]
  skip_before_action :authenticate_user # TODO: temp fix to pass tests
  skip_after_action :verify_authorized, only: %i[index_xlsx index_mini index_idea_markers filter_counts]
  after_action :verify_policy_scoped, only: %i[index index_mini]
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    @result = IdeasFinder.find(
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
    )
    @ideas = @result.records

    render json: linked_json(@ideas, WebApi::V1::IdeaSerializer, serialization_options)
  end

  def index_mini
    @result = IdeasFinder.find(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[idea_trending_info]
    )
    @ideas = @result.records

    render json: linked_json(@ideas, WebApi::V1::IdeaMiniSerializer, params: fastjson_params(pcs: ParticipationContextService.new))
  end

  def index_idea_markers
    @ideas = IdeasFinder.find(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[author topics areas project idea_status idea_files]
    ).records

    render json: linked_json(@ideas, WebApi::V1::PostMarkerSerializer, params: fastjson_params)
  end

  def index_xlsx
    @result = IdeasFinder.find(
      params,
      scope: policy_scope(Idea).where(publication_status: 'published'),
      current_user: current_user,
      includes: %i[author topics areas project idea_status idea_files],
      paginate: false
    )
    @ideas = @result.records

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def filter_counts
    @result = IdeasFinder.find(params, scope: policy_scope(Idea), current_user: current_user, includes: %i[idea_trending_info])
    @ideas = @result.records.where(publication_status: 'published')
    counts = {
      'idea_status_id' => {},
      'area_id' => {},
      'topic_id' => {}
    }
    @ideas
      .joins('FULL OUTER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
      .joins('FULL OUTER JOIN areas_ideas ON areas_ideas.idea_id = ideas.id')
      .select('idea_status_id, areas_ideas.area_id, ideas_topics.topic_id, COUNT(DISTINCT(ideas.id)) as count')
      .reorder(nil)  # Avoids SQL error on GROUP BY when a search string was used
      .group('GROUPING SETS (idea_status_id, areas_ideas.area_id, ideas_topics.topic_id)')
      .each do |record|
        %w(idea_status_id area_id topic_id).each do |attribute|
          id = record.send attribute
          counts[attribute][id] = record.count if id
        end
      end
    counts['total'] = @result.count
    render json: counts
  end

  def show
    render json: WebApi::V1::IdeaSerializer.new(
      @idea,
      params: fastjson_params,
      include: %i[author topics areas user_vote idea_images]
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

    @idea = Idea.new idea_params
    @idea.author ||= current_user
    service.before_create(@idea, current_user)

    authorize @idea
    verify_profanity @idea

    save_options = {}
    save_options[:context] = :publication if @idea.published?
    ActiveRecord::Base.transaction do
      if @idea.save save_options
        service.after_create(@idea, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          @idea.reload,
          params: fastjson_params,
          include: %i[author topics areas phases user_vote idea_images]
        ).serialized_json, status: :created
      else
        render json: { errors: @idea.errors.details }, status: :unprocessable_entity
      end
    end
  end

  # patch
  def update
    service = SideFxIdeaService.new

    params[:idea][:area_ids] ||= [] if params[:idea].has_key?(:area_ids)
    params[:idea][:topic_ids] ||= [] if params[:idea].has_key?(:topic_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].has_key?(:phase_ids)

    @idea.assign_attributes idea_params
    authorize @idea
    verify_profanity @idea

    service.before_update(@idea, current_user)

    save_options = {}
    save_options[:context] = :publication if @idea.published? # editing a published idea is re-publication
    ActiveRecord::Base.transaction do
      if @idea.save save_options
        authorize @idea
        service.after_update(@idea, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          @idea.reload,
          params: fastjson_params,
          include: [:author, :topics, :areas, :user_vote, :idea_images]
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
      head 500
    end
  end

  private

  def set_idea
    @idea = Idea.find params[:id]
    authorize @idea
  end

  def idea_attributes
    attributes = [
      :publication_status,
      :project_id,
      :author_id,
      :location_description,
      :proposed_budget,
      [idea_images_attributes: [:image]],
      [{ idea_files_attributes: %i[file name] }],
      { location_point_geojson: [:type, { coordinates: [] }],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        body_multiloc: CL2_SUPPORTED_LOCALES,
        topic_ids: [],
        area_ids: [] }
    ]
    project = @idea&.project || Project.find(params.dig(:idea, :project_id))
    if project && UserRoleService.new.can_moderate_project?(project, current_user)
      attributes += %i[idea_status_id budget] + [phase_ids: []]
    end
    attributes
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

  def serialization_options
    if current_user
      # I have no idea why but the trending query part
      # breaks if you don't fetch the ids in this way.
      votes = Vote.where(user: current_user, votable_id: @ideas.map(&:id), votable_type: 'Idea')
      {
        params: fastjson_params(vbii: votes.index_by(&:votable_id), pcs: ParticipationContextService.new),
        include: [:author, :user_vote, :idea_images]
      }
    else
      {
        params: fastjson_params(pcs: ParticipationContextService.new),
        include: [:author, :idea_images]
      }
    end
  end
end

::WebApi::V1::IdeasController.prepend_if_ee 'IdeaAssignment::Patches::WebApi::V1::IdeasController'
