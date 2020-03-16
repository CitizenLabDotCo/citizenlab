class WebApi::V1::ProjectFoldersController < ApplicationController
  before_action :set_project_folder, only: [:show, :update, :destroy]

  def index
    @project_folders = policy_scope(ProjectFolder).includes(:admin_publication, :project_folder_images)
    @project_folders = @project_folders.where(id: params[:filter_ids]) if params[:filter_ids]

    @project_folders = @project_folders
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(
      @project_folders, 
      WebApi::V1::ProjectFolderSerializer, 
      params: fastjson_params, 
      include: [:project_folder_images]
      )
  end

  def show
    render json: WebApi::V1::ProjectFolderSerializer.new(
      @project_folder,
      params: fastjson_params,
      include: [:project_folder_images]
      ).serialized_json
  end

  def by_slug
    @project_folder = ProjectFolder.find_by!(slug: params[:slug])
    authorize @project_folder
    show
  end

  def create
    @project_folder = ProjectFolder.new(project_folder_params)

    authorize @project_folder

    saved = nil
    ActiveRecord::Base.transaction do
      saved = @project_folder.save
      AdminPublication.create!(publication: @project_folder) if saved
    end

    if saved
      SideFxProjectFolderService.new.after_create(@project_folder, current_user)

      render json: WebApi::V1::ProjectFolderSerializer.new(
        @project_folder,
        params: fastjson_params
      ).serialized_json, status: :created
    else
      render json: {errors: @project_folder.errors.details}, status: :unprocessable_entity
    end
  end

  def update
    @project_folder.assign_attributes project_folder_params
    authorize @project_folder
    if @project_folder.save
      SideFxProjectFolderService.new.after_update(@project_folder, current_user)
      render json: WebApi::V1::ProjectFolderSerializer.new(
        @project_folder,
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @project_folder.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    frozen_folder = nil
    ActiveRecord::Base.transaction do
      @project_folder.projects.each(&:destroy!)
      frozen_folder = @project_folder.destroy
    end
    if frozen_folder.destroyed?
      SideFxProjectFolderService.new.after_destroy(frozen_folder, current_user)
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
    @project_folder = ProjectFolder.find(params[:id])
    authorize @project_folder
  end

  def project_folder_params
    params.require(:project_folder).permit(
      :header_bg,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      description_preview_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
