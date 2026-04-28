class WebApi::V1::SpacesController < ApplicationController
  before_action :set_space, only: %i[show update destroy]

  def index
    authorize :space, :index?
    @spaces = policy_scope(Space)
    @spaces = paginate @spaces

    if params[:search].present?
      @spaces = @spaces.search_by_title(params[:search])
    end

    moderators_per_space = UserRoleService.new.moderators_per_space(
      @spaces.pluck(:id)
    )

    render json: linked_json(
      @spaces,
      WebApi::V1::SpaceSerializer,
      params: jsonapi_serializer_params(
        moderators_per_space:
      ),
      include: %i[moderators]
    )
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
