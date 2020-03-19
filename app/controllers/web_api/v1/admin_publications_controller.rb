class WebApi::V1::AdminPublicationsController < ::ApplicationController
  before_action :set_admin_publication, only: [:reorder]

  def index
    @publications = policy_scope(AdminPublication)

    @publications = @publications.where(publication_type: ProjectFolder.name)
      .or(@publications.where(publication: ProjectsFilteringService.new.apply_common_index_filters(
        Pundit.policy_scope(current_user, Project), 
        params.except(:folder))))

    if params.key? :folder
      parent_scope = if params[:folder].present?
        AdminPublication.where(publication_id: params[:folder], publication_type: ProjectFolder.name)
      else # top-level projects and folders
        nil 
      end
      @publications = @publications.where(parent_id: parent_scope)
    end

    if params[:filter_empty_folders].present?
      visible_folder_publication_ids = Pundit.policy_scope(current_user, Project)
        .includes(:admin_publication).pluck('admin_publications.parent_id').compact.uniq
      @publications = @publications.where(publication_type: ProjectFolder.name, id: visible_folder_publication_ids)
        .or(@publications.where(publication_type: Project.name))
    end

    @publications = @publications
      .order(:ordering)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(
      @publications, 
      WebApi::V1::AdminPublicationSerializer, 
      params: fastjson_params
      )
  end

  def reorder
    if @publication.insert_at(permitted_attributes(@publication)[:ordering])
      SideFxAdminPublicationService.new.after_update(@publication, current_user)
      render json: WebApi::V1::AdminPublicationSerializer.new(
        @publication, 
        params: fastjson_params, 
        ).serialized_json, status: :ok
    else
      render json: {errors: @publication.errors.details}, status: :unprocessable_entity
    end
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
