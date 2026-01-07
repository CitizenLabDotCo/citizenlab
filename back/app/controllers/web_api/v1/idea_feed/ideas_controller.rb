# frozen_string_literal: true

module WebApi
  module V1
    module IdeaFeed
      class IdeasController < ::ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: [:index]

        def index
          scope = policy_scope(Idea)
          feed_service = ::IdeaFeed::FeedService.new(@phase, current_user, topic_ids: params[:topics])
          ideas = feed_service.top_n(page_size, scope)
          total_count = feed_service.eligible_ideas_count(scope)

          render json: {
            **WebApi::V1::IdeaSerializer.new(ideas, params: jsonapi_serializer_params).serializable_hash,
            links: build_feed_links(ideas, total_count)
          }
        end

        private

        def set_phase
          @phase = Phase.find(params[:id])
          authorize @phase, :show?
        end

        def page_size
          params.dig(:page, :size)&.to_i || 20
        end

        def page_number
          params.dig(:page, :number)&.to_i || 1
        end

        def total_pages(total_count)
          [(total_count.to_f / page_size).ceil, 1].max
        end

        def build_feed_links(_ideas, total_count)
          last_page = total_pages(total_count)
          {
            self: build_link(page_number),
            first: build_link(1),
            prev: page_number > 1 ? build_link(page_number - 1) : nil,
            next: page_number < last_page ? build_link(page_number + 1) : nil,
            last: build_link(last_page)
          }
        end
      end
    end
  end
end
