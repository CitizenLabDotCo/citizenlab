module NLP
  module WebApi
    module V1
      class TagsController < ApplicationController

        skip_after_action :verify_authorized, only: [:generate_tags]


        def generate_tags
          locale = params['locale']
          @tags = TagSuggestionService.new.suggest(policy_scope(Idea).where(id: params['idea_ids']), locale).map { |e|
            Tag.create(title_multiloc: {
              locale => e["text"]
            })
          }

          render json: ::WebApi::V1::TagSerializer.new(@tags, params: fastjson_params).serialized_json, status: :ok
        end
      end

      def index
        @tags = Tag.all
          .page(params.dig(:page, :number))
          .per(params.dig(:page, :size))

        render json: linked_json(@tags, WebApi::V1::TagSerializer, params: fastjson_params)
      end

      private

      def secure_controller?
        false
      end
    end
  end
end
