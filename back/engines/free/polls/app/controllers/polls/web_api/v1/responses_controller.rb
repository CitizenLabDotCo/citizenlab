# frozen_string_literal: true

module Polls
  module WebApi
    module V1
      class ResponsesController < PollsController
        before_action :set_phase
        skip_before_action :authenticate_user

        def index_xlsx
          authorize Project.find(@phase.project.id), :index_xlsx?
          @responses = policy_scope(Response)
            .where(phase: @phase)
            .includes(:user, response_options: [:option])
            .order(:created_at)
          I18n.with_locale(current_user&.locale) do
            xlsx = XlsxService.new.generate_poll_results_xlsx @phase, @responses, current_user
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'polling_results.xlsx'
          end
        end

        def create
          @response = Response.new(response_params)
          @response.user = current_user
          @response.phase = @phase
          authorize @response

          if @response.save(context: :response_submission)
            SideFxResponseService.new.after_create(@response, current_user)
            head :created
          else
            render json: { errors: @response.errors.details }, status: :unprocessable_entity
          end
        end

        def responses_count
          authorize Project.find(@phase.project.id), :responses_count?

          @counts = policy_scope(Response)
            .joins(:response_options)
            .where(phase: @phase)
            .group('polls_response_options.option_id')
            .order('polls_response_options.option_id')
            .count

          render json: raw_json({ series: { options: @counts } })
        end

        private

        def set_phase
          if params[:phase_id]
            @phase = Phase.find(params[:phase_id])
          else
            head :not_found
          end
        end

        def response_params
          params.require(:response).permit(
            response_options_attributes: [:option_id]
          )
        end
      end
    end
  end
end
