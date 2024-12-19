# frozen_string_literal: true

class WebApi::V1::FilesController < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  skip_before_action :authenticate_user

  CONSTANTIZER = {
    'Idea' => {
      container_class: Idea,
      file_class: IdeaFile,
      policy_scope_class: IdeaFilePolicy::Scope,
      file_relationship: :idea_files,
      container_id: :idea_id
    },
    'Project' => {
      container_class: Project,
      file_class: ProjectFile,
      policy_scope_class: ProjectFilePolicy::Scope,
      file_relationship: :project_files,
      container_id: :project_id
    },
    'ProjectFolder' => {
      container_class: ProjectFolders::Folder,
      file_class: ProjectFolders::File,
      policy_scope_class: ProjectFolders::FilePolicy::Scope,
      file_relationship: :files,
      container_id: :project_folder_id
    },
    'Event' => {
      container_class: Event,
      file_class: EventFile,
      policy_scope_class: EventFilePolicy::Scope,
      file_relationship: :event_files,
      container_id: :event_id
    },
    'Phase' => {
      container_class: Phase,
      file_class: PhaseFile,
      policy_scope_class: PhaseFilePolicy::Scope,
      file_relationship: :phase_files,
      container_id: :phase_id
    },
    'StaticPage' => {
      container_class: StaticPage,
      file_class: StaticPageFile,
      policy_scope_class: StaticPageFilePolicy::Scope,
      file_relationship: :static_page_files,
      container_id: :static_page_id
    }
  }

  before_action :set_container, only: %i[index create]
  before_action :set_file, only: %i[show destroy update]
  skip_after_action :verify_policy_scoped

  def index
    @files = @container.send(secure_constantize(:file_relationship)).order(:ordering)
    @files = secure_constantize(:policy_scope_class).new(pundit_user, @files).resolve
    render json: WebApi::V1::FileSerializer.new(@files, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::FileSerializer.new(@file, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @file = @container.send(secure_constantize(:file_relationship)).new create_file_params
    authorize @file
    if @file.save
      render json: WebApi::V1::FileSerializer.new(
        @file,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: transform_carrierwave_error_details(@file.errors, :file) }, status: :unprocessable_entity
    end
  end

  def update
    if @file.update(update_file_params)
      render json: WebApi::V1::FileSerializer.new(@file, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: transform_carrierwave_error_details(@file.errors, :file) }, status: :unprocessable_entity
    end
  end

  def destroy
    file = @file.destroy
    if file.destroyed?
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def create_file_params
    params_of_file = params.require(:file).permit(
      :file,
      :ordering,
      :name
    )
    returned_file_params = {}
    if params_of_file[:file] || params_of_file[:name]
      returned_file_params[:file_by_content] = {
        content: params_of_file[:file],
        name: params_of_file[:name]
      }
    end
    returned_file_params[:ordering] ||= params_of_file[:ordering]
    returned_file_params
  end

  def update_file_params
    params.require(:file).permit(:ordering)
  end

  def set_file
    @file = secure_constantize(:file_class).find params[:id]
    authorize @file
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = secure_constantize(:container_class).find container_id
  end

  def secure_constantize(key)
    CONSTANTIZER.fetch(params[:container_type])[key]
  end
end
