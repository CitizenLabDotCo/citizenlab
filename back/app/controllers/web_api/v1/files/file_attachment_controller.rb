# frozen_string_literal: true

class WebApi::V1::Files::FileAttachmentController < ApplicationController
  def index
    file_attachments = policy_scope(Files::FileAttachment)
      .includes(:file, :attachable)

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
    create_params = params.require(:file_attachment).permit(
      :file_id,
      :attachable_id,
      :attachable_type,
      :position
    )

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
end
