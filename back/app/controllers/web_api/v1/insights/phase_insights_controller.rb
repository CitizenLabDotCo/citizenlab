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
          group_by = params.permit(:group_by)[:group_by]
          custom_field = group_by.present? ? CustomField.find_by(key: group_by) : nil
          error = validate_voting_phase_and_custom_field(group_by, custom_field)

          if error
            render json: { errors: error }, status: :unprocessable_entity
            return
          end

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

        def validate_voting_phase_and_custom_field(group_by, custom_field)
          unless @phase.participation_method == 'voting'
            return { phase: [{ error: 'Not a voting phase' }] }
          end

          return nil if group_by.blank?

          if custom_field.nil?
            { group_by: [{ error: 'custom_field not found with the key provided' }] }
          elsif custom_field.resource_type != 'User'
            { group_by: [{ error: 'Invalid custom_field resource_type for grouping' }] }
          elsif !custom_field.supports_reference_distribution?
            { group_by: [{ error: 'Custom field input_type or key not supported for grouping' }] }
          end
        end
      end
    end
  end
end
