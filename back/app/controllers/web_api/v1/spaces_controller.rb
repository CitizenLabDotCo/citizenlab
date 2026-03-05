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
    # Fetch all admin publications ordered by left value (nested set ordering)
    # This gives us the tree in pre-order traversal
    publications = AdminPublication.includes(:publication)
      .order(:lft)

    # Group by parent_id for efficient lookup
    grouped = publications.group_by(&:parent_id)
    
    # Build the tree structure
    roots = grouped[nil] || []
    
    nodes = roots.map do |root_pub|
      node = {
        id: root_pub.publication_id,
        type: root_pub.publication_type == 'ProjectFolders::Folder' ? 'folder' : 'project'
      }
      
      # If it's a folder, add children
      if root_pub.publication_type == 'ProjectFolders::Folder'
        children = grouped[root_pub.id] || []
        node[:children] = children.map do |child_pub|
          {
            id: child_pub.publication_id,
            type: 'project' # Children of folders are always projects
          }
        end
      end
      
      node
    end

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
