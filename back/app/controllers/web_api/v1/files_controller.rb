# frozen_string_literal: true

class WebApi::V1::FilesController < ApplicationController
  include CarrierwaveErrorDetailsTransformation

  skip_before_action :authenticate_user

  # Maps container types (as used in params) to their corresponding container classes and
  # the key of the container ID in params. Ideally, the ID parameter should be the same
  # for all container types (for example, +container_id+).
  CONTAINER_MAPPINGS = {
    'Idea' => [Idea, :idea_id],
    'Project' => [Project, :project_id],
    'ProjectFolder' => [ProjectFolders::Folder, :project_folder_id],
    'Event' => [Event, :event_id],
    'Phase' => [Phase, :phase_id],
    'StaticPage' => [StaticPage, :static_page_id]
  }

  def index
    file_attachments = policy_scope(container.file_attachments.includes(:file))

    render json: WebApi::V1::FileAttachmentSerializerAsLegacyFile.new(
      file_attachments,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def show
    render json: serialize_file(file_attachment)
  end

  def create
    file_attachment = authorize(build_file_attachment)
    file_attachment.file.save!
    file_attachment.save!

    render json: serialize_file(file_attachment), status: :created
  rescue ActiveRecord::RecordInvalid
    errors = format_errors(file_attachment)
    render json: { errors: }, status: :unprocessable_entity
  end

  def update
    position = params.dig(:file, :ordering)

    if file_attachment.update(position:)
      render json: serialize_file(file_attachment)
    else
      errors = format_errors(file_attachment)
      render json: { errors: }, status: :unprocessable_entity
    end
  end

  def destroy
    file_attachment.destroy!
    SideFxFileService.new.after_destroy(file_attachment)

    head :ok
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: file_attachment.errors.details }, status: :unprocessable_entity
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

  def file_attachment
    @file_attachment ||= authorize(
      # TODO: (tech-debt) Ideally, we should use the id of the file, not the id of the
      #   file attachment.
      Files::FileAttachment.includes(:file).find(params[:id])
    )
  end

  def container
    @container ||= begin
      container_class, id_key = CONTAINER_MAPPINGS.fetch(params[:container_type])
      container_class.find(params[id_key])
    end
  end

  def serialize_file(file)
    WebApi::V1::FileAttachmentSerializerAsLegacyFile
      .new(file, params: jsonapi_serializer_params)
      .serializable_hash
  end

  def build_file_attachment
    file_params = create_file_params

    files_file = Files::File.new(
      content_by_content: file_params[:file_by_content].slice(:content, :name),
      uploader: current_user
    )

    if (project = container.try(:project))
      files_file.files_projects.build(project: project)
    end

    Files::FileAttachment.new(
      file: files_file,
      attachable: container,
      position: file_params[:ordering]
    )
  end

  def format_errors(file_attachment)
    # Surface the file errors in the response.
    file_errors = transform_carrierwave_error_details(file_attachment.file.errors, :content)
    # TODO: Adapt the front-end to use "content" instead of "file".
    file_errors[:file] = file_errors.delete(:content)
    file_errors.merge(file_attachment.errors.details)
  end
end
