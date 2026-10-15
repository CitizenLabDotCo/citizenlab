class WebApi::V1::SpacesController < ApplicationController
  before_action :set_space, only: %i[show update reorder destroy]

  def index
    authorize :space, :index?
    @spaces = policy_scope(Space)
    # A search orders by relevance; otherwise in the order admins arranged.
    @spaces = if params[:search].present?
      @spaces.search_by_title(params[:search])
    else
      @spaces.order(:ordering, :id)
    end

    @spaces = paginate @spaces
    space_ids = @spaces.pluck(:id)

    render json: linked_json(
      @spaces,
      WebApi::V1::SpaceSerializer,
      params: jsonapi_serializer_params(
        moderators_per_space: UserRoleService.new.moderators_per_space(space_ids),
        folders_count_per_space: ProjectFolders::Folder.where(space_id: space_ids).group(:space_id).count,
        projects_count_per_space: Project.not_hidden.where(space_id: space_ids).group(:space_id).count
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

  def reorder
    raw_ordering = permitted_attributes(@space)[:ordering]
    return render json: { errors: { ordering: [{ error: 'blank' }] } }, status: :unprocessable_entity if raw_ordering.blank?

    ordering = parse_ordering(raw_ordering)
    return render json: { errors: { ordering: [{ error: 'invalid' }] } }, status: :unprocessable_entity unless ordering

    # A position past the end moves the space to the end, so positions stay
    # 0..n-1 and never overflow the column.
    ordering = [ordering, Space.maximum(:ordering).to_i].min

    # insert_at returns false when the space is already at that position, which
    # is a success; only validation errors fail the request.
    @space.insert_at(ordering)
    if @space.errors.empty?
      render json: WebApi::V1::SpaceSerializer.new(
        @space.reload,
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

  # A whole, non-negative position, sent as a number or as text (form and
  # query params arrive as text). acts_as_list raises on anything else.
  def parse_ordering(raw)
    return raw if raw.is_a?(Integer) && !raw.negative?

    raw.to_i if raw.is_a?(String) && raw.match?(/\A\d+\z/)
  end

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
