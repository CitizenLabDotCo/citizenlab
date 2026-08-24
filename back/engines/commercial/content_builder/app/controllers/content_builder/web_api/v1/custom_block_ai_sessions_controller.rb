# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class CustomBlockAISessionsController < ApplicationController
        def create
          custom_block = CustomBlock.find(params[:custom_block_id])
          session = CustomBlockAISession.new(
            custom_block: custom_block,
            created_by: current_user
          )
          authorize session

          if session.save
            render json: serialize_session(session), status: :created
          else
            render json: { errors: session.errors.details }, status: :unprocessable_entity
          end
        end

        def create_turn
          session = CustomBlockAISession.find(params[:id])
          authorize session, :create?

          turn_params = params.require(:turn).permit(
            :user_message,
            tool_results: %i[tool_use_id content is_error]
          )
          user_message = turn_params[:user_message]
          tool_results = turn_params[:tool_results]

          if user_message.blank? == tool_results.blank?
            render json: {
              errors: { turn: [{ error: 'exactly_one_of_user_message_or_tool_results' }] }
            }, status: :unprocessable_entity
            return
          end

          result = authoring_service.run(
            session,
            user_message: user_message,
            tool_results: tool_results&.map(&:to_h)&.map(&:symbolize_keys)
          )

          render json: {
            data: {
              id: "#{session.id}-#{session.transcript.length}",
              type: 'custom_block_ai_turn',
              attributes: result
            }
          }, status: :ok
        rescue CustomBlockAuthoringService::TranscriptTooLongError
          render json: {
            errors: { turn: [{ error: 'session_too_long' }] }
          }, status: :unprocessable_entity
        rescue Aws::BedrockRuntime::Errors::ServiceError => e
          ErrorReporter.report(e)
          render json: {
            errors: { turn: [{ error: 'llm_unavailable' }] }
          }, status: :service_unavailable
        end

        private

        def serialize_session(session)
          WebApi::V1::CustomBlockAISessionSerializer.new(
            session,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def authoring_service
          @authoring_service ||= CustomBlockAuthoringService.new
        end
      end
    end
  end
end
