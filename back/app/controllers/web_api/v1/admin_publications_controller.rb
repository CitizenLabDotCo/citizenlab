# frozen_string_literal: true

class WebApi::V1::AdminPublicationsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_admin_publication, only: %i[reorder show]

  def index
    # By default, this endpoint will remove unlisted projects that the user cannot moderate.
    # But if the `remove_all_unlisted` parameter is set to 'true', it will
    # even remove all unlisted projects.
    policy_context[:remove_unlisted] = if params[:remove_all_unlisted] == 'true'
      'remove_all_unlisted'
    else
      'remove_unlisted_that_user_cannot_moderate'
    end

    admin_publications = policy_scope(AdminPublication.includes(:parent))
    admin_publications = admin_publication_filterer.filter(admin_publications, params.merge(current_user: current_user))

    admin_publications = case params[:sort]
    when 'title_multiloc'
      sort_by_title_multiloc(admin_publications, 'ASC')
    when '-title_multiloc'
      sort_by_title_multiloc(admin_publications, 'DESC')
    when nil
      admin_publications.order('admin_publications.ordering ASC')
    else
      raise 'Unsupported sort method'
    end

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

    visible_not_draft_admin_publications = policy_scope(AdminPublication.includes(:parent)).not_draft
    admin_publications = admin_publication_filterer.filter(visible_not_draft_admin_publications,
      params.merge(current_user: current_user, remove_not_allowed_parents: true))

    # Performance-wise it is not optimal to break the query-chain like this, but it avoids a conflict
    # between the in_order_of method and SELECT_DISTINCT that can be included elsewhere in the query chain.
    # Since we do not expect large collections to be selected for this widget, this is an acceptable trade-off.
    subquery = admin_publications.where(id: ids).select(:id).distinct
    admin_publications = AdminPublication.where(id: subquery).in_order_of(:id, ids)

    @admin_publications = paginate admin_publications
    @admin_publications = includes_publications(@admin_publications)

    authorize @admin_publications, :index_select_and_order_by_ids?

    render json: linked_json(
      @admin_publications,
      WebApi::V1::AdminPublicationSerializer,
      params: jsonapi_serializer_params(
        visible_children_count_by_parent_id: admin_publication_filterer.visible_children_counts_by_parent_id
      ),
      include: included_for_publications
    )
  end

  def reorder
    # The 'ordering' parameter should be a number representing the target
    # position of the admin_publication in the list of its siblings.
    # It is NOT an index! It indicates which item it should replace based on the
    # value of the 'ordering' attribute.
    # So for example, AdminPublication.pluck(:id, :ordering) could return something like
    # [['a', 2], ['b', 3], ['c', 4]]
    # To then move 'a' to the position of 'b', you would do
    # web_api/v1/admin_publications/a/reorder?ordering=3
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

  # Sorts admin publications by the title_multiloc of their associated
  # publication (Project or ProjectFolder::Folder),
  # in the specified direction ('ASC' or 'DESC').
  # The sorting respects the user's locale and falls back to another locale
  # if the title is nil or blank in the user's locale.
  #
  # @param admin_publications [ActiveRecord::Relation] The admin publications to sort.
  # @param direction [String] The direction to sort ('ASC' or 'DESC').
  # @return [ActiveRecord::Relation] The sorted admin publications.
  def sort_by_title_multiloc(admin_publications, direction)
    prioritized_locales = [current_user.locale, *AppConfiguration.instance.settings('core', 'locales')].uniq

    coalesce_sql_projects = prioritized_locales.map do |locale|
      "NULLIF(projects.title_multiloc->>'#{locale}', '')"
    end.join(', ')

    coalesce_sql_folders = prioritized_locales.map do |locale|
      "NULLIF(project_folders_folders.title_multiloc->>'#{locale}', '')"
    end.join(', ')

    admin_publications
      .joins("LEFT JOIN projects ON admin_publications.publication_id = projects.id AND admin_publications.publication_type = 'Project'")
      .joins("LEFT JOIN project_folders_folders ON admin_publications.publication_id = project_folders_folders.id AND admin_publications.publication_type = 'ProjectFolders::Folder'")
      .select(
        'admin_publications.*',
        "COALESCE(
          #{coalesce_sql_projects},
          #{coalesce_sql_folders}
        ) AS title_for_sorting"
      )
      .order("title_for_sorting #{direction}")
  end
end

WebApi::V1::AdminPublicationsController.include(AggressiveCaching::Patches::WebApi::V1::AdminPublicationsController)
