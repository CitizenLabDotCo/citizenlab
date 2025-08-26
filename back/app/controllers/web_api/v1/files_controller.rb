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
    files = @container.send(secure_constantize(:file_relationship)).order(:ordering)

    if files.empty?
      file_attachments = policy_scope(@container.file_attachments.includes(:file))
      render json: WebApi::V1::FileAttachmentSerializerAsLegacyFile.new(
        file_attachments,
        params: jsonapi_serializer_params
      ).serializable_hash
    else
      files = secure_constantize(:policy_scope_class).new(pundit_user, files).resolve
      render json: WebApi::V1::FileSerializer.new(
        files,
        params: jsonapi_serializer_params
      ).serializable_hash
    end
  end

  def show
    render json: serialize_file(@file)
  end

  def create
    container_files = @container.send(secure_constantize(:file_relationship))

    # If there exist files using the legacy file class, continue using it. We'll migrate
    # all the files of a given container at once. They cannot be mixed.
    file = if container_files.exists?
      @container.send(secure_constantize(:file_relationship)).new(create_file_params)
    else
      build_file_attachment
    end

    authorize(file)

    if file.save
      render json: serialize_file(file), status: :created
    else
      render json: { errors: transform_carrierwave_error_details(file.errors, :file) }, status: :unprocessable_entity
    end
  end

  def update
    new_ordering = params.dig(:file, :ordering)
    return render(json: serialize_file(@file)) unless new_ordering

    if @file.is_a?(Files::FileAttachment)
      @file.position = new_ordering
    else
      @file.ordering = new_ordering
    end

    if @file.save
      render json: serialize_file(@file)
    else
      render json: { errors: transform_carrierwave_error_details(@file.errors, :file) }, status: :unprocessable_entity
    end
  end

  def destroy
    @file.destroy!
    SideFxFileService.new.after_destroy(@file)

    head :ok
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: @file.errors.details }, status: :unprocessable_entity
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
    # First attempt to find using legacy file class
    @file = secure_constantize(:file_class).find(params[:id])
    authorize @file
  rescue ActiveRecord::RecordNotFound
    # Fall back to FileAttachment lookup
    @file = Files::FileAttachment.includes(:file).find(params[:id])
    authorize @file
  end

  def set_container
    container_id = params[secure_constantize(:container_id)]
    @container = secure_constantize(:container_class).find container_id
  end

  def secure_constantize(key)
    CONSTANTIZER.fetch(params[:container_type])[key]
  end

  def serialize_file(file)
    serializer_class = file.is_a?(Files::FileAttachment) ? WebApi::V1::FileAttachmentSerializerAsLegacyFile : WebApi::V1::FileSerializer
    serializer_class.new(file, params: jsonapi_serializer_params).serializable_hash
  end

  def build_file_attachment
    file_params = create_file_params

    files_file = Files::File.new(
      content_by_content: file_params[:file_by_content].slice(:content, :name),
      uploader: current_user
    )

    if (project = @container.try(:project))
      files_file.files_projects.build(project: project)
    end

    Files::FileAttachment.new(
      file: files_file,
      attachable: @container,
      position: file_params[:ordering]
    )
  end
end
