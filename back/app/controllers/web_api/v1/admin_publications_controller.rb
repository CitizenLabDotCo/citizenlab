# frozen_string_literal: true

class WebApi::V1::AdminPublicationsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    admin_publication_filterer = AdminPublicationsFilteringService.new
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
      @admin_publications = @admin_publications.includes(
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
      included = %i[
        publication
        publication.avatars
        publication.project_images
        publication.images
        publication.current_phase
        publication.phases
      ]
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

  # For use with 'Open to participation' homepage widget.
  # Returns all published or archived admin_publications for projects that are currently in an
  # active participatory phase (where user can do something).
  # Ordered by the end date of the current phase, soonest first (nulls last).
  def index_projects_with_active_participatory_phase
    admin_publication_filterer = AdminPublicationsFilteringService.new
    admin_publications = policy_scope(AdminPublication)
    admin_publications = admin_publication_filterer.filter(
      admin_publications,
      params.merge(
        current_user: current_user,
        only_projects: true,
        publication_statuses: %w[published archived]
      )
    )

    allowed_participation_methods = %w[ideation native_survey poll proposals survey volunteering voting]

    # Use a subquery to limit results to those related to current participatory phase & include the phases.end_at column
    subquery = admin_publications
      .joins('LEFT OUTER JOIN projects AS projects ON projects.id = admin_publications.publication_id')
      .joins('INNER JOIN phases AS phases ON phases.project_id = projects.id')
      .where(
        'phases.start_at <= ? AND (phases.end_at >= ? OR phases.end_at IS NULL) AND phases.participation_method IN (?)',
        Time.zone.now.to_fs(:db), Time.zone.now.to_fs(:db), allowed_participation_methods
      )
      .select('admin_publications.*, phases.end_at AS phase_end_at')

    # Perform the SELECT DISTINCT on the outer query
    admin_publications = AdminPublication
      .from(subquery, :admin_publications)
      .distinct
      .order('phase_end_at ASC NULLS LAST')

    @admin_publications = paginate admin_publications

    @admin_publications = @admin_publications.includes(
      {
        publication: %i[
          phases
          admin_publication
          project_images
          avatars
        ]
      },
      parent: [:publication]
    )

    authorize @admin_publications, :index_projects_with_active_participatory_phase?

    render json: linked_json(
      @admin_publications,
      WebApi::V1::AdminPublicationSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: admin_publication_filterer.visible_children_counts_by_parent_id
      ),
      include: %i[
        publication
        publication.avatars
        publication.project_images
        publication.current_phase
        publication.phases
        parent
        parent.publication
      ]
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
end

WebApi::V1::AdminPublicationsController.include(AggressiveCaching::Patches::WebApi::V1::AdminPublicationsController)
