module ReportBuilder
  class Queries::SurveyQuestionResult < ReportBuilder::Queries::Base
    def run_query(
      phase_id: nil,
      question_id: nil,
      slice_mode: nil,
      slice_field_id: nil,
      **_other_props
    )
      return {} if phase_id.blank? || question_id.blank?

      phase = Phase.find(phase_id)
      service = SurveyResponseSlicer.new(phase)

      if slice_mode.nil? || slice_field_id.nil?
        service.get_result(question_id)
      elsif slice_mode == 'user_field'
        service.slice_by_user_field(
          question_id,
          slice_field_id
        )
      else
        service.slice_by_other_question(
          question_id,
          slice_field_id
        )
      end
    end
  end
end
