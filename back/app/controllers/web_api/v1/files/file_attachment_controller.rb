# frozen_string_literal: true

class WebApi::V1::Files::FileAttachmentController < ApplicationController
  def show
    render json: WebApi::V1::Files::FileAttachmentSerializer.new(
      file_attachment,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  private

  def file_attachment
    @file_attachment ||= authorize(
      Files::FileAttachment.includes(:file).find(params[:id])
    )
  end
end
