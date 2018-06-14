class WebApi::V1::ClusteringsController < ApplicationController
  before_action :set_clustering, only: [:show, :update, :destroy]

  def index
    @clusterings = policy_scope(Clustering)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: @clusterings
  end

  def show
    render json: @clustering
  end

  def create
    @clustering = Clustering.new(clustering_params)

    options = {}
    options[:drop_empty] = params[:clustering][:drop_empty] != 'false'

    @ideas = policy_scope(Idea)
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
    if (params[:filter_trending] == 'true') && !params[:search].present?
      @ideas = trending_idea_service.filter_trending @ideas
    end
    @ideas = @ideas.where('upvotes_count >= ?', params[:minimal_upvotes]) if params[:minimal_upvotes].present?
    @ideas = @ideas.where('downvotes_count >= ?', params[:minimal_downvotes]) if params[:minimal_downvotes].present?
    @ideas = @ideas.where('(upvotes_count + downvotes_count) >= ?', params[:minimal_total_votes]) if params[:minimal_total_votes].present?

    @clustering.structure = ClusteringService.new.build_structure(
      params[:clustering][:levels],
      @ideas,
      options
    )

    authorize @clustering

    if @clustering.save
      render json: @clustering, status: :created
    else
      render json: { errors: @clustering.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @clustering.assign_attributes clustering_params
    if @clustering.save
      render json: @clustering, status: :ok
    else
      render json: { errors: @clustering.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    clustering = @clustering.destroy
    if clustering.destroyed?
      head :ok
    else
      head 500
    end
  end


  private

  def set_clustering
    @clustering = Clustering.find(params[:id])
    authorize @clustering
  end

  def clustering_params
    all_structures = params.require(:clustering).fetch(:structure, nil).try(:permit!)
    params.require(:clustering).permit(
      title_multiloc: I18n.available_locales,
    ).merge(:structure => all_structures)
  end

  def secure_controller?
    false
  end
end
