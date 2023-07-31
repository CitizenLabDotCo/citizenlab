# frozen_string_literal: true
require "google/cloud/vision"

class WebApi::V1::HandwrittenIdeasController < ApplicationController
  vision_client = Google::Cloud::Vision.image_annotator

  def create
    # vision_client.document_text_detection(
    #   image: 
    # )
  end
end