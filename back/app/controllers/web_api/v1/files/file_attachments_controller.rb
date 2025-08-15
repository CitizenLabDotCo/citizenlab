# frozen_string_literal: true

class WebApi::V1::Files::FileAttachmentsController < ApplicationController
  skip_before_action :authenticate_user, only: %i[index show]

  def index
    where_conditions = {
      file_id: params[:file_id],
      # Either the attachable_id is passed explicitly or the attachable is the parent
      # resource. For example, .../projects/:project_id/file_attachments.
      attachable_id: attachable_id_from_path || params[:attachable_id]
    }.compact

    file_attachments = policy_scope(Files::FileAttachment)
      .includes(:file, :attachable)
      .where(where_conditions)

    render json: WebApi::V1::Files::FileAttachmentSerializer.new(
      file_attachments,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def show
    render json: WebApi::V1::Files::FileAttachmentSerializer.new(
      file_attachment,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    file_attachment = Files::FileAttachment.new(create_params)
    authorize(file_attachment)

    side_fx.before_create(file_attachment, current_user)
    if file_attachment.save
      side_fx.after_create(file_attachment, current_user)
      render json: WebApi::V1::Files::FileAttachmentSerializer.new(
        file_attachment,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: file_attachment.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    update_params = params.require(:file_attachment).permit(:position)

    authorize(file_attachment)

    side_fx.before_update(file_attachment, current_user)
    if file_attachment.update(update_params)
      side_fx.after_update(file_attachment, current_user)

      render json: WebApi::V1::Files::FileAttachmentSerializer.new(
        file_attachment,
        params: jsonapi_serializer_params
      ).serializable_hash
    else
      render json: { errors: file_attachment.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    side_fx.before_destroy(file_attachment, current_user)
    destroyed_attachment = file_attachment.destroy!
    side_fx.after_destroy(destroyed_attachment, current_user)
    head :ok
  rescue ActiveRecord::RecordNotDestroyed
    render json: { errors: file_attachment.errors.details }, status: :unprocessable_entity
  end

  private

  def file_attachment
    @file_attachment ||= authorize(
      Files::FileAttachment.includes(:file).find(params[:id])
    )
  end

  def side_fx
    @side_fx ||= Files::SideFxFileAttachmentService.new
  end

  def create_params
    # If the resource is nested (for example, /projects/:project_id/file_attachments),
    # the +attachable_id+ and +attachable_type+ are inferred from the path.
    # In this case, parameters inferred from the path take precedence.
    from_path = {
      attachable_id: attachable_id_from_path,
      attachable_type: attachable_type_from_path
    }.compact

    params.require(:file_attachment).permit(
      :file_id,
      :position,
      :attachable_id,
      :attachable_type
    ).merge(from_path)
  end

  def attachable_type_from_path
    @attachable_type_from_path ||= if request.path_parameters[:concern] == :file_attachable
      request.path_parameters.fetch(:attachable_type)
    end
  end

  def attachable_id_from_path
    @attachable_id_from_path ||= if request.path_parameters[:concern] == :file_attachable
      parent_ids.last
    end
  end

  def parent_ids
    request.path_parameters.select { |k, _| k.to_s.end_with?('_id') }.values
  end
end
