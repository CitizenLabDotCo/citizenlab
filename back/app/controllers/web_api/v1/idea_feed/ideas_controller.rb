# frozen_string_literal: true

module WebApi
  module V1
    module IdeaFeed
      class IdeasController < ::ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: [:index]

        def index
          scope = policy_scope(Idea)
          scope = scope.with_some_input_topics_and_children(params[:topics]) if params[:topics]

          feed_service = ::IdeaFeed::FeedService.new(
            @phase,
            user: current_user,
            visitor_hash: VisitorHashService.new.generate_for_request(request)
          )

          ideas = feed_service.top_n(page_size, scope)

          ActiveRecord::Associations::Preloader.new(
            records: ideas,
            associations: [
              :idea_images,
              :input_topics,
              :phases,
              :ideas_phases,
              :idea_status,
              :creation_phase,
              { project: [:phases], author: [:unread_notifications] }
            ]
          ).call

          render json: WebApi::V1::IdeaSerializer.new(ideas, params: jsonapi_serializer_params).serializable_hash
        end

        private

        def set_phase
          @phase = Phase.find(params[:id])
          authorize @phase, :show?
        end

        def page_size
          params.dig(:page, :size)&.to_i || 20
        end
      end
    end
  end
end

WebApi::V1::IdeaFeed::IdeasController.include(AggressiveCaching::Patches::WebApi::V1::IdeaFeed::IdeasController)
