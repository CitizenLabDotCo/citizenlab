# frozen_string_literal: true
require "google/cloud/vision"

class WebApi::V1::HandwrittenIdeasController < ApplicationController
  vision_client = Google::Cloud::Vision.image_annotator

  def create
    render json: vision_client.document_text_detection(
      image: params[:file],
      async: false
    )
  end
end