module Surveys
  class WebApi::V1::ResponsesController < SurveysController

    skip_after_action :verify_authorized, only: [:index_xlsx]
    before_action :set_participation_context

    def index_xlsx
      authorize [:surveys, :response], :index_xlsx?
      @responses = policy_scope(Response)
        .where(participation_context: @participation_context)
        .order(:created_at)

      hash_array = @responses.map do |response|
        {
          submitted_at: response.submitted_at,
          started_at: response.started_at
        }.tap do |row|
          answers = response.answers.each do |answer|
            row[answer['question_text']] = answer['value']
          end
        end
      end

      xlsx = XlsxService.new.hash_array_to_xlsx(hash_array)

      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'survey_responses.xlsx'
    end

    def set_participation_context
      @participation_context = params[:pc_class].find(params[:participation_context_id])
    end

  end
end