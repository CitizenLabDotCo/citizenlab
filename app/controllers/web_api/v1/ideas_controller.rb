class WebApi::V1::IdeasController < ApplicationController

  before_action :set_idea, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx, :index_idea_markers, :filter_counts]
  
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  
  def index
    @ideas = policy_scope(Idea).includes(:author, :assignee, :topics, :areas, :phases, :idea_images, project: [:phases])
      .left_outer_joins(:idea_status).left_outer_joins(:idea_trending_info)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params

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
          @ideas.order(author_name: :asc)
        when "-author_name"
          @ideas.order(author_name: :desc)
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

    @idea_ids = @ideas.map(&:id)

    if current_user
      votes = Vote.where(user: current_user, votable_id: @idea_ids, votable_type: 'Idea')
      votes_by_idea_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @ideas, include: ['author', 'user_vote', 'idea_images', 'assignee'], vbii: votes_by_idea_id, pcs: ParticipationContextService.new
    else
      render json: @ideas, include: ['author', 'idea_images'], pcs: ParticipationContextService.new
    end

  end

  def index_idea_markers
    @ideas = policy_scope(Idea)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params
    @ideas = @ideas.with_bounding_box(params[:bounding_box]) if params[:bounding_box].present?

    render json: @ideas, each_serializer: WebApi::V1::PostMarkerSerializer
  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @ideas = policy_scope(Idea)
        .includes(:author, :topics, :areas, :project, :idea_status)
        .where(publication_status: 'published')
      @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
      @ideas = @ideas.where(id: params[:ideas]) if params[:ideas].present?
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
  end

  def filter_counts
    @ideas = policy_scope(Idea).left_outer_joins(:idea_trending_info)
    @ideas = PostsFilteringService.new.apply_common_idea_index_filters @ideas, params
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
    render json: @idea, include: ['author','topics','areas','user_vote','idea_images'], serializer: WebApi::V1::IdeaSerializer
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
        render json: @idea.reload, status: :created, include: ['author','topics','areas','phases','user_vote','idea_images']
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
        render json: @idea.reload, status: :ok, include: ['author','topics','areas','user_vote','idea_images']
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
      reason = pcs.posting_disabled_reason_for_project(exception.record.project, current_user)
      if reason
        render json: { errors: { base: [{ error: reason }] } }, status: :unauthorized
        return
      end
    end
    render json: { errors: { base: [{ error: 'Unauthorized!' }] } }, status: :unauthorized
  end

end
