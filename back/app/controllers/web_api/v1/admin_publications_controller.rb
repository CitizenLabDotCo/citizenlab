# frozen_string_literal: true

class WebApi::V1::AdminPublicationsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    admin_publications = policy_scope(AdminPublication.includes(:parent))
    admin_publications = admin_publication_filterer.filter(admin_publications, params.merge(current_user: current_user))

    # A flattened ordering, such that project publications with a parent (projects in folders) are ordered
    # first by their parent's :ordering, and then by their own :ordering (their ordering within the folder).
    admin_publications = admin_publications.select(
      'admin_publications.*',
      'CASE WHEN admin_publications.parent_id IS NULL THEN admin_publications.ordering ELSE parents.ordering END
      AS root_ordering'
    )
      .joins('LEFT OUTER JOIN admin_publications AS parents ON parents.id = admin_publications.parent_id')
      .order('root_ordering, admin_publications.ordering')

    @admin_publications = paginate admin_publications

    included = []

    if params[:include_publications] == 'true'
      @admin_publications = includes_publications(@admin_publications)
      included = included_for_publications
    else
      @admin_publications = @admin_publications.includes(:publication, :children)
    end

    render json: linked_json(
      @admin_publications,
      WebApi::V1::AdminPublicationSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: admin_publication_filterer.visible_children_counts_by_parent_id
      ),
      include: included
    )
  end

  # For use with 'Selected items' homepage widget.
  # Returns non-draft admin_publications for specified IDs, ordered by order of the specified IDs.
  # => [AdminPublication]
  def index_select_and_order_by_ids
    ids = params[:ids]

    visible_admin_publications = policy_scope(AdminPublication.includes(:parent))
    admin_publications = visible_admin_publications.not_draft.where(id: ids).in_order_of(:id, ids)

    @admin_publications = paginate admin_publications
    @admin_publications = includes_publications(@admin_publications)

    authorize @admin_publications, :index_select_and_order_by_ids?

    # Replicate visible_children_counts_by_parent_id from the AdminPublicationsFilteringService
    # as, unfortunately, we cannot use the service here due to our use of the 'in_order_of' command.
    # If we invoke the service as we do in the index action, to create the counts as an instance var, we get the error:
    # PG::InvalidColumnReference: ERROR:  for SELECT DISTINCT, ORDER BY expressions must appear in select list
    visible_children_counts_by_parent_id = Hash.new(0).tap do |counts|
      parent_ids = visible_admin_publications.pluck(:parent_id).compact
      parent_ids.each { |id| counts[id] += 1 }
    end

    render json: linked_json(
      @admin_publications,
      WebApi::V1::AdminPublicationSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: visible_children_counts_by_parent_id
      ),
      include: included_for_publications
    )
  end

  def reorder
    if @admin_publication.insert_at(permitted_attributes(@admin_publication)[:ordering])
      SideFxAdminPublicationService.new.after_update(@admin_publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @admin_publication,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @admin_publication.errors.details }, status: :unprocessable_entity
    end
  end

  def status_counts
    authorize :admin_publication, :status_counts

    admin_publication_filterer = AdminPublicationsFilteringService.new
    admin_publications = policy_scope(AdminPublication.includes(:parent))
    admin_publications = admin_publication_filterer.filter(admin_publications, params)

    counts = admin_publications.group(:publication_status).count

    render json: raw_json({ status_counts: counts })
  end

  def show
    render json: WebApi::V1::AdminPublicationSerializer.new(
      @admin_publication,
      params: jsonapi_serializer_params
    ).serializable_hash, status: :ok
  end

  private

  def set_admin_publication
    @admin_publication = AdminPublication.find params[:id]
    authorize @admin_publication
  end

  def admin_publication_filterer
    @admin_publication_filterer ||= AdminPublicationsFilteringService.new
  end

  def includes_publications(admin_publications)
    admin_publications.includes(
      {
        publication: [
          { phases: %i[report custom_form permissions] },
          :admin_publication,
          :images,
          :project_images,
          :content_builder_layouts
        ]
      },
      :children
    )
  end

  def included_for_publications
    %i[
      publication
      publication.avatars
      publication.project_images
      publication.images
      publication.current_phase
      publication.phases
    ]
  end
end

WebApi::V1::AdminPublicationsController.include(AggressiveCaching::Patches::WebApi::V1::AdminPublicationsController)
