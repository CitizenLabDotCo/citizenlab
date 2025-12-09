module WebApi
  module V1
    module Insights
      class PhaseInsightsController < ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: %i[show_insights voting_insights]

        def show_insights
          insights_data = @phase.pmethod.phase_insights_class.new(@phase).call

          render json: WebApi::V1::Insights::PhaseInsightsSerializer.new(
            @phase,
            params: jsonapi_serializer_params.merge(**insights_data)
          ).serializable_hash
        end

        def voting_insights
          # Example placeholder for voting-specific insights action
          Rails.logger.info "Voting action called on phase #{@phase.id}"
        end

        private

        def set_phase
          @phase = Phase.find params[:phase_id]
          authorize @phase
        end
      end
    end
  end
end
