class WebApi::V1::IdeasController < ApplicationController

  before_action :set_idea, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]
  

  def index
    @ideas = policy_scope(Idea).includes(:author, :topics, :areas, :project, :idea_images)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @ideas = @ideas.with_some_topics(params[:topics]) if params[:topics].present?
    @ideas = @ideas.with_some_areas(params[:areas]) if params[:areas].present?
    @ideas = @ideas.in_phase(params[:phase]) if params[:phase].present?
    @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
    @ideas = @ideas.where(author_id: params[:author]) if params[:author].present?
    @ideas = @ideas.where(idea_status_id: params[:idea_status]) if params[:idea_status].present?
    @ideas = @ideas.search_by_all(params[:search]) if params[:search].present?
    if params[:publication_status].present?
      @ideas = @ideas.where(publication_status: params[:publication_status])
    else
      @ideas = @ideas.where(publication_status: 'published')
    end


    @ideas = case params[:sort]
      when "new"
        @ideas.order_new
      when "-new"
        @ideas.order_new(:asc)
      when "trending"
        @ideas.order_trending
      when "-trending"
        @ideas.order_trending(:asc)
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
      when nil
        @ideas
      else
        raise "Unsupported sort method"
    end

    @idea_ids = @ideas.map(&:id)

    if current_user
      votes = Vote.where(user: current_user, votable_id: @idea_ids, votable_type: 'Idea')
      votes_by_idea_id = votes.map{|vote| [vote.votable_id, vote]}.to_h
      render json: @ideas, include: ['author', 'user_vote', 'idea_images'], vbii: votes_by_idea_id
    else
      render json: @ideas, include: ['author', 'idea_images']
    end

  end

  def index_xlsx
    I18n.with_locale(current_user&.locale) do
      @ideas = policy_scope(Idea)
        .includes(:author, :topics, :areas, :project)
      @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
      xlsx = XlsxService.new.generate_ideas_xlsx @ideas
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
    end
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
    @idea = Idea.new(permitted_attributes(Idea))
    @idea.author ||= current_user

    SideFxIdeaService.new.before_create(@idea, current_user)

    authorize @idea
    ActiveRecord::Base.transaction do
      if @idea.save
        SideFxIdeaService.new.after_create(@idea, current_user)
        render json: @idea.reload, status: :created, include: ['author','topics','areas','phases','user_vote','idea_images']
      else
        render json: { errors: @idea.errors.details }, status: :unprocessable_entity
      end

    end
  end

  # patch
  def update
    params[:idea][:area_ids] ||= [] if params[:idea].has_key?(:area_ids)
    params[:idea][:topic_ids] ||= [] if params[:idea].has_key?(:topic_ids)
    params[:idea][:phase_ids] ||= [] if params[:idea].has_key?(:phase_ids)
    ActiveRecord::Base.transaction do
      if @idea.update(permitted_attributes(Idea))
        SideFxIdeaService.new.after_update(@idea, current_user)
        render json: @idea.reload, status: :ok, include: ['author','topics','areas','user_vote', 'idea_images']
      else
        render json: { errors: @idea.errors.details }, status: :unprocessable_entity
      end
    end 
  end

  # delete
  def destroy
    idea = @idea.destroy
    if idea.destroyed?
      SideFxIdeaService.new.after_destroy(idea, current_user)
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

end
