module Tagging
  module WebApi
    module V1
      class TaggingsController < ApplicationController

        def index_automatic
          render json: WebApi::V1::TaggingSerializer.new(Tagging.automatic.all, params: fastjson_params).serialized_json, status: :ok
        end

        def create
          @tagging = Tagging.new(permitted_attributes(Tagging))
          @tagging.assignment_method = :manual
          @tagging.confidence_score = 1
          authorize @tagging

          # SideFxTaggingService.new.before_create(@tagging, current_user)
          if @tagging.save
            # SideFxTaggingService.new.after_create(@tagging, current_user)
            render json: WebApi::V1::TaggingSerializer.new(
              @tagging,
              params: fastjson_params
              ).serialized_json, status: :created
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def secure_controller?
          false
        end
      end
    end
  end
end
