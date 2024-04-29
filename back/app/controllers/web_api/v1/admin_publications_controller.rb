# frozen_string_literal: true

class WebApi::V1::AdminPublicationsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    publication_filterer = AdminPublicationsFilteringService.new
    publications = policy_scope(AdminPublication.includes(:parent))
    publications = publication_filterer.filter(publications, params.merge(current_user: current_user))

    publications = publications.select(
      'admin_publications.*',
      'CASE WHEN admin_publications.parent_id IS NOT NULL
      THEN parents.ordering + (admin_publications.ordering / 10.0) + 0.05
      ELSE admin_publications.ordering
      END AS compound_ordering'
    )
      .joins('LEFT OUTER JOIN admin_publications AS parents ON parents.id = admin_publications.parent_id')
      .order('compound_ordering ASC')

    # Ruby non-sql version (just for testing)
    # compound_ordering = publications.index_with { |p| p&.parent ? p.parent.ordering + (p.ordering / 10.0) + 0.05 : p.ordering }
    # publications = compound_ordering.sort_by { |_k, v| v }.to_h.keys
    # publications.each { |p| puts p.publication.title_multiloc['en'] } # <= 'correctly' ordered
    # publications = AdminPublication.where(id: publications.map(&:id)) # This loses the ordering, obviously

    @publications = publications.includes(:publication, :children)

    @publications = paginate @publications

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
