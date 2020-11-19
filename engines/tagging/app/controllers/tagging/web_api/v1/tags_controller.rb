module Tagging
  module WebApi
    module V1
      class TagsController < ApplicationController
        before_action :set_tag, only: [:show]

        def index
          @tags = policy_scope(Tag)

          @tags = @tags.search_by_all(params[:search]) if params[:search].present?

          @tags = @tags
                   .page(params.dig(:page, :number))
                   .per(params.dig(:page, :size))

          render json: linked_json(@tags, WebApi::V1::TagSerializer, params: fastjson_params)
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
