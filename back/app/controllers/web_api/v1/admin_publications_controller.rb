# frozen_string_literal: true

class WebApi::V1::AdminPublicationsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    publication_filterer = AdminPublicationsFilteringService.new
    publications = policy_scope(AdminPublication.includes(:parent))
    publications = publication_filterer.filter(publications, params.merge(current_user: current_user))

    # A flattened ordering, such that project publications with a parent (projects in folders) are ordered
    # first by their parent's :ordering, and then by their own :ordering (their ordering within the folder).
    publications = publications.select(
      'admin_publications.*',
      'CASE WHEN admin_publications.parent_id IS NULL THEN admin_publications.ordering ELSE parents.ordering END
      AS root_ordering'
    )
      .joins('LEFT OUTER JOIN admin_publications AS parents ON parents.id = admin_publications.parent_id')
      .order('root_ordering, admin_publications.ordering')

    @publications = paginate publications
    @publications = @publications.includes(:publication, :children)

    render json: linked_json(
      @publications,
      WebApi::V1::AdminPublicationSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: publication_filterer.visible_children_counts_by_parent_id
      )
    )
  end

  def reorder
    if @publication.insert_at(permitted_attributes(@publication)[:ordering])
      SideFxAdminPublicationService.new.after_update(@publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @publication,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
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

    render json: raw_json({ status_counts: counts })
  end

  def show
    render json: WebApi::V1::AdminPublicationSerializer.new(
      @publication,
      params: jsonapi_serializer_params
    ).serializable_hash, status: :ok
  end

  private

  def set_admin_publication
    @publication = AdminPublication.find params[:id]
    authorize @publication
  end
end
