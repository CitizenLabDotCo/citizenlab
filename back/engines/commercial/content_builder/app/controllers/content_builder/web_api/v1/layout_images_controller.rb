# frozen_string_literal: true

module ContentBuilder
  class WebApi::V1::LayoutImagesController < ApplicationController
    def create
      @image = LayoutImage.new image_params
      authorize @image

      sidefx.before_create @image, current_user
      if @image.save
        sidefx.after_create @image, current_user
        render json: WebApi::V1::LayoutImageSerializer.new(
          @image,
          params: jsonapi_serializer_params
        ).serializable_hash.to_json, status: :created
      else
        if @image.errors.details[:image].include?({ error: 'processing_error' })
          ErrorReporter.report_msg @image.errors.details.to_s
        end
        render json: { errors: transform_errors_details!(@image.errors.details) }, status: :unprocessable_entity
      end
    end

    private

    def image_params
      params.require(:layout_image).permit(:image)
    end

    def sidefx
      @sidefx ||= SideFxLayoutImageService.new
    end

    def transform_errors_details!(error_details)
      # carrierwave does not return the error code symbols by default
      error_details = error_details.dup
      error_details[:image] = error_details[:image]&.uniq { |e| e[:error] }
      error_details
    end
  end
end
