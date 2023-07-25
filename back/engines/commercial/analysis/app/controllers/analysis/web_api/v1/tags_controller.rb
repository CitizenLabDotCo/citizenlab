# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class TagsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          @tags = @analysis.tags
          render json: WebApi::V1::TagSerializer.new(@tags, params: jsonapi_serializer_params).serializable_hash
        end

        def create
          @tag = @analysis.tags.new(tag_params)
          @tag.tag_type = 'custom'
          if @tag.save
            side_fx_service.after_create(@tag, current_user)
            render json: WebApi::V1::TagSerializer.new(
              @tag,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @tag = @analysis.tags.find(params[:id])
          if @tag.update(tag_params)
            side_fx_service.after_update(@tag, current_user)
            render json: WebApi::V1::TagSerializer.new(
              @tag,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :ok
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @tag = @analysis.tags.find(params[:id])
          if @tag.destroy
            side_fx_service.after_destroy(@tag, current_user)
            head :ok
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def side_fx_service
          @side_fx_service ||= SideFxTagService.new
        end

        def tag_params
          params.require(:tag).permit(:name)
        end
      end
    end
  end
end
