module Surveys
  module WebApi
    module V1
      class ResponsesController < SurveysController

        skip_after_action :verify_authorized, only: [:index_xlsx]
        before_action :set_participation_context
        rescue_from TypeformApiParser::AuthorizationError, with: :typeform_authorization_error

        def index_xlsx
          if @participation_context
            authorize Project.find_by!(id: @participation_context.project.id), :index_xlsx?
          else
            authorize [:surveys, :response], :index_xlsx?
          end

          # If the real-time API request ever gets problematic, this uses the saved webhook responses instead
          # @responses = policy_scope(Response)
          #   .where(participation_context: @participation_context)
          #   .order(:created_at)

          @responses = TypeformApiParser.new.get_responses(@participation_context.typeform_form_id)

          I18n.with_locale(current_user&.locale) do
            xlsx = XlsxService.new.generate_survey_results_xlsx @responses
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'survey_responses.xlsx'
          end
        end

        def set_participation_context
          @participation_context = params[:pc_class].find(params[:participation_context_id])
        end

        def typeform_authorization_error exception
          render json: { errors: { base: [{ error: exception.error_key, message: exception.description }] } }, status: 403
        end
      end
    end
  end
end