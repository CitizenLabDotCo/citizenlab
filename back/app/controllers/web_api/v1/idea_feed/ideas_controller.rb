# frozen_string_literal: true

module WebApi
  module V1
    module IdeaFeed
      class IdeasController < ::ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: [:index]

        def index
          feed_service = ::IdeaFeed::FeedService.new(@phase, current_user, topic_ids: params[:topics])
          ideas = feed_service.top_n(page_size, policy_scope(Idea))

          render json: WebApi::V1::IdeaSerializer.new(ideas, params: jsonapi_serializer_params).serializable_hash
        end

        private

        def set_phase
          @phase = Phase.find(params[:id])
          authorize @phase, :show?
        end

        def page_size
          params.dig(:page, :size)&.to_i || 5
        end
      end
    end
  end
end
