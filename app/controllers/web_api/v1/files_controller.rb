class WebApi::V1::FilesController < ApplicationController

  CONSTANTIZER = {
    'Idea' => {
      container_class: Idea,
      file_class: IdeaFile,
      policy_scope_class: IdeaFilePolicy::Scope,
      file_relationship: :idea_files,
      container_id: :idea_id
    },
    'Initiative' => {
      container_class: Initiative,
      file_class: InitiativeFile,
      policy_scope_class: InitiativeFilePolicy::Scope,
      file_relationship: :initiative_files,
      container_id: :initiative_id
    },
    'Project' => {
      container_class: Project,
      file_class: ProjectFile,
      policy_scope_class: ProjectFilePolicy::Scope,
      file_relationship: :project_files,
      container_id: :project_id
    }
  }

  before_action :set_container, only: [:index, :create]
  before_action :set_file, only: [:show, :update, :destroy]
  skip_after_action :verify_policy_scoped

  def index
    @files = @container.send(secure_constantize(:file_relationship)).order(:ordering)
    @files = secure_constantize(:policy_scope_class).new(current_user, @files).resolve
    render json: WebApi::V1::FileSerializer.new(@files, params: fastjson_params).serialized_json
  end

  def show
    render json: WebApi::V1::FileSerializer.new(@file, params: fastjson_params).serialized_json
  end

  def create
    @file = @container.send(secure_constantize(:file_relationship)).create(file_params)
    authorize @file
    if @file.save
      render json: WebApi::V1::FileSerializer.new(
        @file, 
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def update
    if @file.update(file_params)
      render json: WebApi::V1::FileSerializer.new(
        @file, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: {errors: transform_errors_details!(@file.errors.details)}, status: :unprocessable_entity
    end
  end

  def destroy
    file = @file.destroy
    if file.destroyed?
      head :ok
    else
      head 500
    end
  end


  private

  def secure_controller?
    false
  end

  def file_params
    params.require(:file).permit(
      :file,
      :ordering,
      :name
    )
  end

  def set_file
    @file = secure_constantize(:file_class).find(params[:id])
    authorize @file
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = secure_constantize(:container_class).find(container_id)
  end

   def transform_errors_details! error_details
    # carrierwave does not return the error code symbols by default
    error_details[:file] = error_details[:file]&.uniq{|e| e[:error]}
    error_details
  end

  def secure_constantize key
    CONSTANTIZER.fetch(params[:container_type])[key]
  end
end
