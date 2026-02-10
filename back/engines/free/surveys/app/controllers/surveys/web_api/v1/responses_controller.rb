# frozen_string_literal: true

module Surveys
  module WebApi
    module V1
      class ResponsesController < SurveysController
        before_action :set_phase
        rescue_from TypeformApiParser::AuthorizationError, with: :typeform_authorization_error

        def index_xlsx
          if @phase
            authorize @phase.project, :index_xlsx?
          else
            authorize %i[surveys response], :index_xlsx?
          end

          # If the real-time API request ever gets problematic, this uses the saved webhook responses instead
          # @responses = policy_scope(Response)
          #   .where(phase: @phase)
          #   .order(:created_at)

          @responses = TypeformApiParser.new.get_responses(@phase.typeform_form_id)

          I18n.with_locale(current_user&.locale) do
            xlsx = XlsxService.new.generate_survey_results_xlsx @responses
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'survey_responses.xlsx'
          end
        end

        def set_phase
          @phase = Phase.find(params[:phase_id])
        end

        def typeform_authorization_error(exception)
          render json: { errors: { base: [{ error: exception.error_key, message: exception.description }] } }, status: :forbidden
        end
      end
    end
  end
end
