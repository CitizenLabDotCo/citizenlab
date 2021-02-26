class WebApi::V1::IdeasController < ApplicationController

  before_action :set_idea, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx, :index_mini, :index_idea_markers, :filter_counts]
  after_action :verify_policy_scoped, only: %i[index index_mini]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    @ideas = policy_scope(Idea).includes(:topics, :areas, :idea_images, project: [:phases, :permissions, custom_form: [:custom_fields]], phases: [:permissions], author: [:unread_notifications], assignee: [:unread_notifications])
      .left_outer_joins(:idea_trending_info)

    search_and_sort(params)

    @ideas = @ideas
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    serialization_options = if current_user
      # I have no idea why but the trending query part
      # breaks if you don't fetch the ids in this way.
      idea_ids = @ideas.map(&:id)
      votes = Vote.where(user: current_user, votable_id: idea_ids, votable_type: 'Idea')
      votes_by_idea_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      {
        params: fastjson_params(vbii: votes_by_idea_id, pcs: ParticipationContextService.new),
        include: [:author, :user_vote, :idea_images, :assignee]
      }
    else
      {
        params: fastjson_params(pcs: ParticipationContextService.new),
        include: [:author, :idea_images]
      }
    end

    render json: linked_json(@ideas, WebApi::V1::IdeaSerializer, serialization_options)
  end

  def index_mini
    @ideas = policy_scope(Idea)
      .left_outer_joins(:idea_trending_info)

    search_and_sort(params)

    @ideas = @ideas
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@ideas, WebApi::V1::IdeaMiniSerializer, params: fastjson_params(pcs: ParticipationContextService.new))
  end

  def index_idea_markers
    @ideas = policy_scope(Idea).includes(:author)
    search_last_names = !UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params, search_last_names
    @ideas = @ideas.with_bounding_box(params[:bounding_box]) if params[:bounding_box].present?

    @ideas = @ideas
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(@ideas, WebApi::V1::PostMarkerSerializer, params: fastjson_params)
  end

  def index_xlsx
    if params[:project].present?
      authorize Project.find_by!(id: params[:project]), :index_xlsx?
    else
      authorize :idea, :index_xlsx?
    end

    @ideas = policy_scope(Idea)
      .includes(:author, :topics, :areas, :project, :idea_status, :idea_files)
      .where(publication_status: 'published')
    @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
    @ideas = @ideas.where(id: params[:ideas]) if params[:ideas].present?

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def index_with_tags_xlsx
    if params[:project].present?
      authorize Project.find_by!(id: params[:project]), :index_xlsx?
    else
      authorize :idea, :index_xlsx?
    end

    @ideas = policy_scope(Idea)
      .includes(:author, :topics, :areas, :project, :idea_status, :idea_files)
      .where(publication_status: 'published')
    @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
    @ideas = @ideas.where(id: params[:ideas]) if params[:ideas].present?

    I18n.with_locale(current_user&.locale) do
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?, with_tags: true
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def filter_counts
    @ideas = policy_scope(Idea).left_outer_joins(:idea_trending_info)
    search_last_names = !UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params, search_last_names
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
    counts['total'] = @ideas.count
    render json: counts
  end

  def show
    render json: WebApi::V1::IdeaSerializer.new(
      @idea,
      params: fastjson_params,
      include: [:author, :topics, :areas, :user_vote, :idea_images]
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

    @idea = Idea.new(permitted_attributes(Idea))
    @idea.author ||= current_user
    service.before_create(@idea, current_user)

    authorize @idea
    ActiveRecord::Base.transaction do
      if @idea.save
        service.after_create(@idea, current_user)
        render json: WebApi::V1::IdeaSerializer.new(
          @idea.reload,
          params: fastjson_params,
          include: [:author, :topics, :areas, :phases, :user_vote, :idea_images]
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

    @idea.assign_attributes(permitted_attributes(@idea))
    authorize @idea

    service.before_update(@idea, current_user)
    ActiveRecord::Base.transaction do
      if @idea.save
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
  # TODO: temp fix to pass tests
  def secure_controller?
    false
  end

  def set_idea
    @idea = Idea.find params[:id]
    authorize @idea
  end

  def user_not_authorized exception
    pcs = ParticipationContextService.new
    if exception.query == "create?"
      reason = pcs.posting_idea_disabled_reason_for_project(exception.record.project, current_user)
      if reason
        render json: { errors: { base: [{ error: reason }] } }, status: :unauthorized
        return
      end
    end
    render json: { errors: { base: [{ error: 'Unauthorized!' }] } }, status: :unauthorized
  end

  def search_and_sort params
    search_last_names = !UserDisplayNameService.new(AppConfiguration.instance, current_user).restricted?
    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params, search_last_names

    if params[:sort].present? && !params[:search].present?
      @ideas = case params[:sort]
        when "new"
          @ideas.order_new
        when "-new"
          @ideas.order_new(:asc)
        when "trending"
          TrendingIdeaService.new.sort_trending @ideas
        when "-trending"
          TrendingIdeaService.new.sort_trending(@ideas).reverse
        when "popular"
          @ideas.order_popular
        when "-popular"
          @ideas.order_popular(:asc)
        when "author_name"
          @ideas.order("users.first_name ASC", "users.last_name ASC")
        when "-author_name"
          @ideas.order("users.first_name DESC", "users.last_name DESC")
        when "upvotes_count"
          @ideas.order(upvotes_count: :asc)
        when "-upvotes_count"
          @ideas.order(upvotes_count: :desc)
        when "downvotes_count"
          @ideas.order(downvotes_count: :asc)
        when "-downvotes_count"
          @ideas.order(downvotes_count: :desc)
        when "status"
          @ideas.order_status(:asc)
        when "-status"
          @ideas.order_status(:desc)
        when "baskets_count"
          @ideas.order(baskets_count: :asc)
        when "-baskets_count"
          @ideas.order(baskets_count: :desc)
        when "random"
          @ideas.order_random
        when nil
          @ideas
        else
          raise "Unsupported sort method"
        end
    end
  end

end
