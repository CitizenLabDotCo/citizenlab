# frozen_string_literal: true
require "google/cloud/vision"

# https://github.com/weg-li/weg-li/blob/9261e1eecbb6bb6eb16393fe99126b9563ce78f5/app/lib/annotator.rb#L4
class WebApi::V1::HandwrittenIdeasController < ApplicationController
  def create
    request = {
      requests: [
        {
          image: {
            content: params[:file][:file]
          },
          image_context: {
            language_hints: ["en"]
          },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION" }
          ]
        }
      ]
    }

    response = image_annotator.batch_annotate_images(request)
    response.responses.first.to_h
  end

  private

  def image_annotator
    @image_annotator ||= Google::Cloud::Vision.image_annotator
  end
end