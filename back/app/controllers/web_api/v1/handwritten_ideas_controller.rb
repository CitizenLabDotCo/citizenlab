# frozen_string_literal: true
require "google/cloud/vision"

# https://github.com/weg-li/weg-li/blob/9261e1eecbb6bb6eb16393fe99126b9563ce78f5/app/lib/annotator.rb#L4
class WebApi::V1::HandwrittenIdeasController < ApplicationController
  skip_before_action :authenticate_user, only: %i[create]
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  def create
    request = {
      requests: [
        {
          image: {
            content: Base64.decode64(
              remove_data_url_prefix(params[:file][:file])
            )
          },
          image_context: {
            language_hints: ["en"]
          },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION", model: 'builtin/latest' }
          ]
        }
      ]
    }

    response = image_annotator.batch_annotate_images(request)
    render json: raw_json({ google_response: response.responses.first.to_h })
  end

  private

  def image_annotator
    @image_annotator ||= Google::Cloud::Vision.image_annotator
  end

  def remove_data_url_prefix(data_url)
    data_url.gsub("data:image/jpeg;base64,", "")
  end
end