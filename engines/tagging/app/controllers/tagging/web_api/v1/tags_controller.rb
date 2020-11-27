module Tagging
  module WebApi
    module V1
      class TagsController < ApplicationController
        before_action :set_tag, only: %i[update]

        def index
          @tags = policy_scope(Tag)

          @tags = @tags.search_by_all(params[:search]) if params[:search].present?
          @tags = @tags.left_outer_joins(:ideas).where(
              ideas: {id: params[:idea_ids]}
              ) if params[:idea_ids].present?

          @tags = @tags
                   .page(params.dig(:page, :number))
                   .per(params.dig(:page, :size))

          render json: linked_json(@tags, WebApi::V1::TagSerializer, params: fastjson_params)
        end

        def update
          @tag.assign_attributes permitted_attributes(@tag)
          authorize @tag
          # SideFxTagService.new.before_update(@tag, current_user)
          if @tag.save
            # SideFxTagService.new.after_update(@tag, current_user)
            render json: WebApi::V1::TagSerializer.new(
              @tag,
              params: fastjson_params
              ).serialized_json, status: :ok
          else
            render json: { errors: @tag.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_tag
          @tag = Tag.find(params[:id])
          authorize @tag
        end

        def secure_controller?
          false
        end
      end
    end
  end
end
