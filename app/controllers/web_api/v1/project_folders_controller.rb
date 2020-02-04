class WebApi::V1::ProjectFoldersController < ApplicationController
  before_action :set_project_folder, only: [:show, :update, :destroy]


  def show
    render json: WebApi::V1::ProjectFolderSerializer.new(
      @project_folder,
      params: fastjson_params,
      include: [:projects]
      ).serialized_json
  end

  def create
    @project_folder = ProjectFolder.new(project_folder_params)

    authorize @project_folder

    if @project_folder.save
      ProjectHolderOrdering.create(project_holder: @project_folder)

      render json: WebApi::V1::ProjectFolderSerializer.new(
        @project_folder,
        params: fastjson_params,
        include: [:projects]
      ).serialized_json, status: :created
    else
      render json: {errors: @project_folder.errors.details}, status: :unprocessable_entity
    end
  end

  def destroy
    project_holder = @project_holder.destroy
    if project_holder.destroyed?
      ProjectHolderOrdering.delete(project_holder: @project_folder)
      head :ok
    else
      head 500
    end
  end

  private

  def set_project_folder
    @project_folder = ProjectFolder.find(params[:id])
    authorize @project_folder
  end

  def project_folder_params
    params.require(:project_folder).permit(
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES,
      description_preview_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
