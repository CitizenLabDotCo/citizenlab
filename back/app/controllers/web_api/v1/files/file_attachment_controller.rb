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

  def destroy
    file_attachment.destroy!
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
end
