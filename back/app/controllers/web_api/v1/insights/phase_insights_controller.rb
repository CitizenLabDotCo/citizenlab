module WebApi
  module V1
    module Insights
      class PhaseInsightsController < ApplicationController
        skip_before_action :authenticate_user
        before_action :set_phase, only: %i[show_insights votes_with_grouping]

        def show_insights
          insights_data = @phase.pmethod.phase_insights_class.new(@phase).call

          render json: WebApi::V1::Insights::PhaseInsightsSerializer.new(
            @phase,
            params: jsonapi_serializer_params.merge(**insights_data)
          ).serializable_hash
        end

        def votes_with_grouping
          unless @phase.participation_method == 'voting'
            render json: { errors: ['Not a voting phase'] }, status: :unprocessable_entity
            return
          end

          counts_data = @phase.pmethod.phase_insights_class.new(@phase).vote_counts_with_user_custom_field_grouping('199de47d-826a-4b23-962c-349622654867')

          render json: WebApi::V1::Insights::VotingPhaseVotesSerializer.new(
            @phase,
            params: jsonapi_serializer_params.merge(**counts_data)
          ).serializable_hash
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
