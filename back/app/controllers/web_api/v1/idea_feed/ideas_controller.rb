# frozen_string_literal: true

module WebApi
  module V1
    module IdeaFeed
      class IdeasController < ::ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: [:index]

        def index
          ideas = policy_scope(@phase.ideas.published)
          ideas = paginate(ideas)

          render json: linked_json(ideas, WebApi::V1::IdeaSerializer, params: { current_user: })
        end

        private

        def set_phase
          @phase = Phase.find(params[:id])
          authorize @phase, :show?
        end
      end
    end
  end
end
