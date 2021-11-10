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

  def status_counts
    authorize :admin_publication, :status_counts
    
    publication_filterer = AdminPublicationsFilteringService.new
    publications = policy_scope(AdminPublication.includes(:parent))
    publications = publication_filterer.filter(publications, params)

    counts = publications.group(:publication_status).count

    render json: { status_counts: counts }
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
