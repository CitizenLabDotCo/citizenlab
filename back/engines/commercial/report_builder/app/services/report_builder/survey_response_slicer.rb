# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseSlicer
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def slice_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      # TODO: check that user field is also select or multiselect

      if question.input_type == 'select'
        slice_by_user_field_select(question, user_field)
      else
        slice_multiselect_responses # TODO
      end
    end

    def slice_by_other_question(question_field_id, other_question_field_id)
      question = get_question(question_field_id)
      other_question = get_question(other_question_field_id)

      if question.input_type == 'select'
        slice_by_other_question_select(question, other_question)
      else
        slice_multiselect_responses # TODO
      end
    end

    private

    def slice_by_user_field_select(question, user_field)
      answers = @inputs
        .joins(:author)
        .select(
          "ideas.custom_field_values->'#{question.key}' as answer",
          "users.custom_field_values->>'#{user_field.key}' as group_by_value"
        )
        .where("ideas.custom_field_values->'#{question.key}' IS NOT NULL")

      collect_answers(answers)
    end

    def slice_by_other_question_select(question, other_question)
      answers = @inputs
        .select(
          "custom_field_values->'#{question.key}' as answer",
          "custom_field_values->>'#{other_question.key}' as group_by_value"
        )
        .where("ideas.custom_field_values->'#{question.key}' IS NOT NULL")

      collect_answers(answers)
    end

    def slice_multiselect_responses
      [] # TODO
    end

    def get_question(question_field_id)
      question = @form.custom_fields.find_by(id: question_field_id)
      throw 'Question not found' unless question
      throw "Unsupported question type: #{question.input_type}" unless %w[select multiselect].include?(question.input_type)

      question
    end

    def collect_answers(answers)
      grouped_answers = Idea
        .select(:answer)
        .from(answers)
        .group(:answer, :group_by_value)
        .count
        .to_a
        .map do |(answer, group_by_value), count|
          {
            answer: answer,
            group_by_value: group_by_value,
            count: count
          }
        end

      {
        totalResponses: grouped_answers.pluck(:count).sum,
        answers: grouped_answers
      }
    end
  end
end
