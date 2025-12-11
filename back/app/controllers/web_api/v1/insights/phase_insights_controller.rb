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
            render json: { errors: { phase: [{ error: 'Not a voting phase' }] } }, status: :unprocessable_entity
            return
          end

          group_by = params.permit(:group_by)[:group_by]
          custom_field = validate_and_find_custom_field(group_by)
          return if performed? # Stop if custom_field validation rendered an error

          counts_data = @phase.pmethod.phase_insights_class.new(@phase).vote_counts_with_user_custom_field_grouping(custom_field)

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

        def validate_and_find_custom_field(group_by)
          return nil if group_by.blank?

          custom_field = CustomField.find_by(key: group_by)
          error = nil

          if custom_field.nil?
            error = 'custom_field not found with the key provided'
          elsif custom_field.resource_type != 'User'
            error = 'Invalid custom_field resource_type for grouping'
          elsif !custom_field.support_reference_distribution? && custom_field.key != 'birthyear'
            error = 'Custom field input_type or key not supported for grouping'
          end

          if error
            render json: { errors: { group_by: [{ error: error }] } }, status: :unprocessable_entity
            return nil
          end

          custom_field
        end
      end
    end
  end
end
