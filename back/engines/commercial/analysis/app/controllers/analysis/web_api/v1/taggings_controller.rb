# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class TaggingsController < ApplicationController
        include FilterParamsExtraction
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          @taggings = @analysis.taggings
          render json: WebApi::V1::TaggingSerializer.new(@taggings, params: jsonapi_serializer_params).serializable_hash
        end

        def create
          @tagging = Tagging.new(tagging_params)
          if @tagging.save
            side_fx_service.after_create(@tagging, current_user)
            render json: WebApi::V1::TaggingSerializer.new(
              @tagging,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @tagging = @analysis.taggings.find(params[:id])
          if @tagging.destroy
            side_fx_service.after_destroy(@tagging, current_user)
            head :ok
          else
            render json: { errors: @tagging.errors.details }, status: :unprocessable_entity
          end
        end

        def bulk_create
          @filters = filters(params[:filters])
          @inputs = InputsFinder.new(@analysis, @filters).execute
          taggings = []
          @inputs.each do |input|
            taggings.push({ tag_id: params[:tag_id], input_id: input.id })
          end
          Tagging.insert_all(taggings)
          head :created
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def side_fx_service
          @side_fx_service ||= SideFxTaggingService.new
        end

        def tagging_params
          params.require(:tagging).permit(:tag_id, :input_id)
        end
      end
    end
  end
end
