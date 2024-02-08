module ReportBuilder
  class Queries::SurveyQuestionResult < ReportBuilder::Queries::Base
    def run_query(
      phase_id: nil,
      question_id: nil,
      group_by_user_field_id: nil,
      **_other_props
    )
      return {} if phase_id.blank? || question_id.blank?

      phase = Phase.find(phase_id)
      service = SurveyResponseSlicer.new(phase)

      if group_by_user_field_id.nil?
        service.get_result(question_id)
      else
        service.slice_by_user_field(
          question_id,
          group_by_user_field_id
        )
      end
    end
  end
end
