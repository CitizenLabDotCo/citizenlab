module Tagging
  module WebApi
    module V1
      class TaggingsController < ApplicationController
        before_action :set_tagging, only: %i[show destroy]

        def index
          @taggings = policy_scope(Tagging)

          @taggings = @taggings.where(idea_id: params["idea_ids"]) if params["idea_ids"]
          @taggings = @taggings.where(assignment_method: params["assignment_method"]) if params["assignment_method"]

          render json: WebApi::V1::TaggingSerializer.new(
            @taggings,
            params: fastjson_params,
            include: [:tag]
          ).serialized_json, status: :ok
        end

        def show
          render json:  WebApi::V1::TaggingSerializer.new(
            @tagging,
            params: fastjson_params,
            include: [:tag]
            ).serialized_json
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
              params: fastjson_params,
              include: [:tag]
              ).serialized_json, status: :created
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          # SideFxTaggingService.new.before_destroy(@tagging, current_user)
          tagging = @tagging.destroy
          if tagging.destroyed?
            # SideFxTaggingService.new.after_destroy(option, current_user)
            head :ok
          else
            head 500
          end
        end

        private

        def set_tagging
          @tagging = Tagging.find(params[:id])
          authorize @tagging
        end

        def secure_controller?
          false
        end
      end
    end
  end
end
