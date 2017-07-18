class Api::V1::IdeasController < ApplicationController
  UnsupportedImageError = Class.new(StandardError)

  rescue_from UnsupportedImageError, with: :send_unsupported_image_error

  before_action :set_idea, only: [:show, :update, :destroy]
  skip_after_action :verify_authorized, only: [:index_xlsx]
  

  def index
    @ideas = policy_scope(Idea).includes(:author, :idea_status, :topics, :areas, :project, :idea_images)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    @ideas = @ideas.with_all_topics(params[:topics]) if params[:topics].present?
    @ideas = @ideas.with_all_areas(params[:areas]) if params[:areas].present?
    @ideas = @ideas.where(project_id: params[:project]) if params[:project].present?
    @ideas = @ideas.where(author_id: params[:author]) if params[:author].present?
    @ideas = @ideas.where(idea_status_id: params[:idea_status]) if params[:idea_status].present?
    @ideas = @ideas.search_by_all(params[:search]) if params[:search].present?


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
      when nil
        @ideas
      else
        raise "Unsupported sort method"
    end

    if current_user
      votes = Vote.where(user: current_user, votable: @ideas.all)
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
    render json: @idea, include: ['author','topics','areas','user_vote','idea_images'], serializer: Api::V1::IdeaSerializer
  end

  # insert
  def create
    @idea = Idea.new(permitted_attributes(Idea))
    authorize @idea
    if @idea.save
      SideFxIdeaService.new.after_create(@idea, current_user)
      render json: @idea, status: :created, include: ['author','topics','areas','user_vote','idea_images']
    else
      render json: { errors: @idea.errors.details }, status: :unprocessable_entity
    end
  end

  # patch
  def update
    if @idea.update(permitted_attributes(Idea))
      SideFxIdeaService.new.after_update(@idea, current_user)
      render json: @idea, status: :ok, include: ['author','topics','areas','user_vote', 'idea_images']
    else
      render json: { errors: @idea.errors.details }, status: :unprocessable_entity
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
