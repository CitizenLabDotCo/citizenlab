# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseSlicer
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def slice(question_field_id, slice_options)
      question = @form.custom_fields.find_by(id: question_field_id)
      return unless question
      return unless %w[select multiselect].include?(field.input_type)
      # TODO: check that group by field is also select or multiselect

      # TODO: implement without group by field
      return if slice_options[:group_by_field].blank?

      if question.input_type == 'select'
        slice_select_responses(question, slice_options[:group_by_field])
      else
        slice_multiselect_responses
      end
    end

    private

    def slice_select_responses(question, group_by_field)
      user_field = CustomField.find_by(id: group_by_field)

      answers = @inputs
        .joins(:author)
        .select(
          "custom_field_values->>'#{question.key}' as answer",
          "users.custom_field_values->>'#{user_field.key}' as group_by_value"
        )
        .where("custom_field_values->'#{question.key}' IS NOT NULL")
        .group(:answer, :group_by_value)
        .count
        .to_a

      {
        totalResponses: answers.pluck(:count).sum,
        answers: answers
      }
    end

    def slice_multiselect_responses
      []
    end
  end
end
