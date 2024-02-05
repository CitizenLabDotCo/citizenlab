module ReportBuilder
  class Queries::SurveyQuestionResult < ReportBuilder::Queries::Base
    def run_query(phase_id: nil, field_id: nil, **_other_props)
      return {} if phase_id.blank? || field_id.blank?

      phase = Phase.find(phase_id)
      SurveyResultsGeneratorService.new(phase).generate_question_result(field_id)
    end
  end
end
