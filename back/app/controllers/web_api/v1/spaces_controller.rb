class WebApi::V1::SpacesController < ApplicationController
  before_action :set_space, only: %i[show update destroy tree_view]

  def index
    authorize :space, :index?
    @spaces = policy_scope(Space)
    @spaces = paginate @spaces
    @spaces = @spaces.includes(:folders, :projects)

    render json: linked_json(@spaces, WebApi::V1::SpaceSerializer, params: jsonapi_serializer_params, include: %i[folders projects])
  end

  def show
    render json: WebApi::V1::SpaceSerializer.new(
      @space,
      params: jsonapi_serializer_params,
      include: %i[folders projects]
    ).serializable_hash
  end

  def create
    @space = Space.new(space_params)
    authorize @space

    if @space.save
      render json: WebApi::V1::SpaceSerializer.new(
        @space,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @space.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @space.assign_attributes space_params

    if @space.save
      render json: WebApi::V1::SpaceSerializer.new(
        @space,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @space.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    if @space.destroy
      head :no_content
    else
      render json: { errors: @space.errors.details }, status: :unprocessable_entity
    end
  end

  def tree_view
    nodes = TreeViewService.new(space_id: @space.id).generate_tree
    render json: raw_json({ nodes: })
  end

  private

  def set_space
    @space = Space.includes(:folders, :projects).find(params[:id])
    authorize @space
  end

  def space_params
    params.require(:space).permit(
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
