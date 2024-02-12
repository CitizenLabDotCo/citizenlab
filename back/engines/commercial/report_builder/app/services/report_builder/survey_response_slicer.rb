# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseSlicer
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def get_result(question_field_id)
      question = get_question(question_field_id)

      sql_question = sql_field(question)

      answers = @inputs.select("#{sql_question} as answer")

      if question.input_type == 'select'
        answers = answers.where("#{sql_question} IS NOT NULL")
      end

      grouped_answers = apply_grouping(answers)
        .map do |answer, count|
          {
            answer: answer,
            count: count
          }
        end

      build_response(grouped_answers, question)
    end

    def slice_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      throw "Unsupported user field type: #{user_field.input_type}" unless user_field.input_type == 'select'

      joined_inputs = @inputs.joins(:author)
      answers = select_answers(joined_inputs, question, user_field)
      grouped_answers = group_answers(answers)

      build_response(grouped_answers, question)
    end

    def slice_by_other_question(question_field_id, other_question_field_id)
      question = get_question(question_field_id)
      other_question = get_question(other_question_field_id)
      throw "Unsupported question type: #{other_question.input_type}" unless other_question.input_type == 'select'

      answers = select_answers(@inputs, question, other_question)
      grouped_answers = group_answers(answers)

      build_response(grouped_answers, question)
    end

    private

    def get_question(question_field_id)
      question = @form.custom_fields.find_by(id: question_field_id)
      throw 'Question not found' unless question
      throw "Unsupported question type: #{question.input_type}" unless %w[select multiselect].include?(question.input_type)

      question
    end

    def sql_field(field)
      table = field.resource_type == 'User' ? 'users' : 'ideas'

      if field.input_type == 'select'
        "#{table}.custom_field_values->'#{field.key}'"
      else
        "jsonb_array_elements(#{table}.custom_field_values->'#{field.key}')"
      end
    end

    def select_answers(inputs, question, slice_field)
      sql_question = sql_field(question)

      answers = inputs.select(
        "#{sql_question} as answer",
        "#{sql_field(slice_field)} as group_by_value"
      )

      if question.input_type == 'select'
        answers = answers.where("#{sql_question} IS NOT NULL")
      end

      answers
    end

    def group_answers(answers)
      apply_grouping(answers, grouped: true)
        .map do |(answer, group_by_value), count|
          {
            answer: answer,
            group_by_value: group_by_value,
            count: count
          }
        end
    end

    def apply_grouping(answers, grouped: false)
      Idea
        .select(:answer)
        .from(answers)
        .group(:answer, grouped ? :group_by_value : nil)
        .order(Arel.sql('COUNT(answer) DESC'))
        .count
        .to_a
    end

    def build_response(grouped_answers, question)
      {
        inputType: question.input_type,
        question: question.title_multiloc,
        required: question.required,
        totalResponses: grouped_answers.pluck(:count).sum,
        answers: grouped_answers,
        customFieldId: field.id
      }
    end
  end
end
