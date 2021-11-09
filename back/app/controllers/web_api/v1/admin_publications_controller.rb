class WebApi::V1::AdminPublicationsController < ::ApplicationController
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    publication_filterer = AdminPublicationsFilteringService.new
    publications = policy_scope(AdminPublication.includes(:parent))
    publications = publication_filterer.filter(publications, params)

    @publications = publications
                    .includes(:publication, :children)
                    .order(:ordering)
                    .page(params.dig(:page, :number))
                    .per(params.dig(:page, :size))

    render json: linked_json(
      @publications,
      WebApi::V1::AdminPublicationSerializer,
      params: fastjson_params(
        visible_children_count_by_parent_id: publication_filterer.visible_children_counts_by_parent_id
      )
    )
  end

  def reorder
    if @publication.insert_at(permitted_attributes(@publication)[:ordering])
      SideFxAdminPublicationService.new.after_update(@publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @publication,
        params: fastjson_params
      ).serialized_json, status: :ok
    else
      render json: { errors: @publication.errors.details }, status: :unprocessable_entity
    end
  end

  def areas_of_projects
    authorize :admin_publication, :areas_of_projects
    
    publications = policy_scope(AdminPublication).includes(:parent)
    
    project_publications = publications.where(publication_type: Project.name).where.not(publication_status: :draft)

    children_of_non_draft_parents = project_publications.where.not(parent: { publication_status: :draft })
    projects_without_parents      = project_publications.where(parent_id: nil)

    visible_project_publications = children_of_non_draft_parents.or(projects_without_parents)

    project_ids = visible_project_publications.where(publication_type: Project.name).where.not(publication_status: :draft).pluck(:publication_id)
    areas_ids = AreasProject.where(project_id: project_ids).pluck(:area_id)
    areas = Area.where(id: areas_ids)

    render json: { areas: areas }
  end

  def show
    render json: WebApi::V1::AdminPublicationSerializer.new(
      @publication,
      params: fastjson_params
    ).serialized_json, status: :ok
  end

  private

  def secure_controller?
    false
  end

  def set_admin_publication
    @publication = AdminPublication.find params[:id]
    authorize @publication
  end
end
