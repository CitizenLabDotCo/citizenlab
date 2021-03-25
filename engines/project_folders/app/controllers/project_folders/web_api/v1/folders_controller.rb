module ProjectFolders
  class WebApi::V1::FoldersController < ::ApplicationController

    before_action :set_project_folder, only: [:show, :update, :destroy]

    def index
      service = AdminPublicationsFilteringService.new
      publications = policy_scope(AdminPublication)
      publications = service.filter(publications, params).where(publication_type: Folder.name)

      @project_folders = Folder.where(id: publications.select(:publication_id))
                               .ordered
                               .includes(:images, admin_publication: [:children])
                               .page(params.dig(:page, :number))
                               .per(params.dig(:page, :size))

      @project_folders = @project_folders.where(id: params[:filter_ids]) if params[:filter_ids]

      # Caches the counts of visible children for
      # the current user.
      render json: linked_json(
          @project_folders,
          WebApi::V1::FolderSerializer,
          params: fastjson_params(visible_children_count_by_parent_id: service.visible_children_counts_by_parent_id),
          include: [:admin_publication, :images]
      )
    end

    def show
      render json: WebApi::V1::FolderSerializer.new(
          @project_folder,
          params: fastjson_params,
          include: [:admin_publication, :images]
      ).serialized_json
    end

    def by_slug
      @project_folder = Folder.find_by!(slug: params[:slug])
      authorize @project_folder
      show
    end

    def create
      @project_folder = Folder.new(project_folder_params)

      authorize @project_folder

      if @project_folder.save
        SideFxService.new.after_create(@project_folder, current_user)

        render json: WebApi::V1::FolderSerializer.new(
            @project_folder,
            params: fastjson_params,
            include: [:admin_publication]
        ).serialized_json, status: :created
      else
        render json: {errors: @project_folder.errors.details}, status: :unprocessable_entity
      end
    end

    def update
      @project_folder.assign_attributes project_folder_params
      authorize @project_folder
      SideFxService.new.before_update(@project_folder, current_user)
      if @project_folder.save
        SideFxService.new.after_update(@project_folder, current_user)
        render json: WebApi::V1::FolderSerializer.new(
            @project_folder,
            params: fastjson_params,
            include: [:admin_publication]
        ).serialized_json, status: :ok
      else
        render json: {errors: @project_folder.errors.details}, status: :unprocessable_entity
      end
    end

    def destroy
      frozen_folder = nil
      ActiveRecord::Base.transaction do
        @project_folder.projects.each(&:destroy!)
        frozen_folder = @project_folder.destroy
      end
      if frozen_folder.destroyed?
        SideFxService.new.after_destroy(frozen_folder, current_user)
        head :ok
      else
        head 500
      end
    end

    private

    def secure_controller?
      false
    end

    def set_project_folder
      @project_folder = Folder.find(params[:id])
      authorize @project_folder
    end

    def project_folder_params
      params.require(:project_folder).permit(
          :header_bg,
          admin_publication_attributes: [:publication_status],
          title_multiloc: CL2_SUPPORTED_LOCALES,
          description_multiloc: CL2_SUPPORTED_LOCALES,
          description_preview_multiloc: CL2_SUPPORTED_LOCALES
      )
    end
  end
end
