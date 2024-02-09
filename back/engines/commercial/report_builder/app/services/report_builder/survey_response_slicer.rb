# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseSlicer
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def get_result(question_field_id)
      question = get_question(question_field_id)

      answers = @inputs
        .select("ideas.custom_field_values->'#{question.key}' as answer")
        .where("ideas.custom_field_values->'#{question.key}' IS NOT NULL")

      grouped_answers = get_counts(answers)
        .map do |answer, count|
          {
            answer: answer,
            count: count
          }
        end

      {
        totalResponses: grouped_answers.pluck(:count).sum,
        answers: grouped_answers
      }
    end

    def slice_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      throw "Unsupported user field type: #{user_field.input_type}" unless user_field.input_type == 'select'

      joined_inputs = @inputs.joins(:author)
      answers = select_answers(joined_inputs, question, user_field)

      collect_answers(answers)
    end

    def slice_by_other_question(question_field_id, other_question_field_id)
      question = get_question(question_field_id)
      other_question = get_question(other_question_field_id)
      throw "Unsupported question type: #{other_question.input_type}" unless other_question.input_type == 'select'

      answers = select_answers(@inputs, question, other_question)

      collect_answers(answers)
    end

    private

    def get_question(question_field_id)
      question = @form.custom_fields.find_by(id: question_field_id)
      throw 'Question not found' unless question
      throw "Unsupported question type: #{question.input_type}" unless %w[select multiselect].include?(question.input_type)

      question
    end

    def select_answers(inputs, question, slice_question)
      slice_question_table = slice_question.resource_type == 'User' ? 'users' : 'ideas'

      if question.input_type == 'select'
        inputs
          .select(
            "ideas.custom_field_values->'#{question.key}' as answer",
            "#{slice_question_table}.custom_field_values->'#{slice_question.key}' as group_by_value"
          )
          .where("ideas.custom_field_values->'#{question.key}' IS NOT NULL")
      else
        inputs
          .select(
            "jsonb_array_elements(ideas.custom_field_values->'#{question.key}') as answer",
            "#{slice_question_table}.custom_field_values->'#{slice_question.key}' as group_by_value"
          )
      end
    end

    def collect_answers(answers)
      grouped_answers = get_counts(answers, grouped: true)
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

    def get_counts(answers, grouped: false)
      Idea
        .select(:answer)
        .from(answers)
        .group(:answer, grouped ? :group_by_value : nil)
        .order(Arel.sql('COUNT(answer) DESC'))
        .count
        .to_a
    end
  end
end
