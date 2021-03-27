module Tagging
  module WebApi
    module V1
      class TagsController < ApplicationController
        before_action :set_tag, only: %i[show update]

        def index
          @tags = policy_scope(Tag)

          @tags = @tags.search_by_all(params[:search]) if params[:search].present?

          @ideas = policy_scope(Idea)
          @ideas = @ideas.where(project_id: params[:projects]) if params[:projects].present?
          @ideas = @ideas.where(id: params[:idea_ids]) if params[:idea_ids].present?

          @tags = @tags.left_outer_joins(:ideas).where({ ideas: {id: @ideas} }) if params[:projects].present? || params[:idea_ids].present?
          @tags = @tags
                  .uniq
          render json: WebApi::V1::TagSerializer.new(@tags, params: fastjson_params).serialized_json
        end

        def show
          render json:  WebApi::V1::TagSerializer.new(
            @tag,
            params: fastjson_params,
            ).serialized_json
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
