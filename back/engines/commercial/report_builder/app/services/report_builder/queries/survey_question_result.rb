module ReportBuilder
  class Queries::SurveyQuestionResult < ReportBuilder::Queries::Base
    def run_query(
      phase_id: nil,
      question_id: nil,
      group_mode: nil,
      group_field_id: nil,
      **_other_props
    )
      return {} if phase_id.blank? || question_id.blank?

      phase = Phase.find(phase_id)
      service = SurveyResponseGrouper.new(phase)

      if group_mode.blank? || group_field_id.blank?
        service.get_result(question_id)
      elsif group_mode == 'user_field'
        service.group_by_user_field(
          question_id,
          group_field_id
        )
      else
        service.group_by_other_question(
          question_id,
          group_field_id
        )
      end
    end
  end
end
