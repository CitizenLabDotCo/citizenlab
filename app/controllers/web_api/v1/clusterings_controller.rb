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

    @clustering.structure = ClusteringService.new.build_structure(
      params[:clustering][:levels],
      policy_scope(Idea),
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
