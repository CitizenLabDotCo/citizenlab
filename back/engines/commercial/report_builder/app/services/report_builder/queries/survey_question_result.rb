module ReportBuilder
  class Queries::SurveyQuestionResult < ReportBuilder::Queries::Base
    def run_query(
      phase_id: nil,
      question_id: nil,
      group_mode: nil,
      group_field_id: nil,
      year: nil,
      quarter: nil,
      **_other_props
    )
      return {} if phase_id.blank? || question_id.blank?

      phase = Phase.find(phase_id)
      service = if group_field_id && group_mode
        Surveys::ResultsWithGroupGenerator.new(
          phase,
          group_mode:,
          group_field_id:,
          year:,
          quarter:
        )
      elsif year && quarter
        Surveys::ResultsWithDateGenerator.new(
          phase,
          year:,
          quarter:
        )
      else
        Surveys::ResultsGenerator.new(phase)
      end

      service.generate_result_for_field(question_id)
    end
  end
end
