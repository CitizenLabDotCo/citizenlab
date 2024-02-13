# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseSlicer
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def get_result(question_field_id)
      question = get_question(question_field_id)

      # Select
      answers = @inputs.select(select_query(question, as: 'answer'))

      # Group by
      grouped_answers = apply_grouping(answers)
        .map do |answer, count|
          {
            answer: answer,
            count: count
          }
        end

      # Filter out invalid keys
      option_keys = question.options.map(&:key)

      grouped_answers = grouped_answers.select do |answer|
        answer[:answer].nil? || option_keys.include?(answer[:answer])
      end

      # Build response
      build_response(grouped_answers, question)
    end

    def slice_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      throw "Unsupported user field type: #{user_field.input_type}" unless user_field.input_type == 'select'

      # Join
      joined_inputs = @inputs.joins(:author)

      # Select
      answers = joined_inputs.select(
        select_query(question, as: 'answer'),
        select_query(user_field, as: 'group_by_value')
      )

      # Group by
      grouped_answers = group_answers(answers)

      # Filter out invalid keys
      grouped_answers = filter_valid_keys(grouped_answers, question, user_field)

      build_response(grouped_answers, question)
    end

    def slice_by_other_question(question_field_id, other_question_field_id)
      question = get_question(question_field_id)
      other_question = get_question(other_question_field_id)
      throw "Unsupported question type: #{other_question.input_type}" unless other_question.input_type == 'select'

      # Select
      answers = @inputs.select(
        select_query(question, as: 'answer'),
        select_query(other_question, as: 'group_by_value')
      )

      # Group by
      grouped_answers = group_answers(answers)

      # Filter out invalid keys
      grouped_answers = filter_valid_keys(grouped_answers, question, other_question)

      build_response(grouped_answers, question)
    end

    private

    def get_question(question_field_id)
      question = @form.custom_fields.find_by(id: question_field_id)
      throw 'Question not found' unless question
      throw "Unsupported question type: #{question.input_type}" unless %w[select multiselect].include?(question.input_type)

      question
    end

    def select_query(field, as: 'answer')
      table = field.resource_type == 'User' ? 'users' : 'ideas'

      if field.input_type == 'select'
        "#{table}.custom_field_values->'#{field.key}' as #{as}"
      else
        %{
          jsonb_array_elements(
            CASE WHEN jsonb_path_exists(#{table}.custom_field_values, '$ ? (!exists (@.#{field.key}))')
              THEN '{"x":[null]}'::jsonb->'x'
              ELSE #{table}.custom_field_values->'#{field.key}' END
          ) as #{as}
        }
      end
    end

    def group_answers(answers)
      apply_grouping(answers, slice_field: true)
        .map do |(answer, group_by_value), count|
          {
            answer: answer,
            group_by_value: group_by_value,
            count: count
          }
        end
    end

    def apply_grouping(answers, slice_field: false)
      Idea
        .select(:answer)
        .from(answers)
        .group(:answer, slice_field ? :group_by_value : nil)
        .order(Arel.sql('COUNT(answer) DESC'))
        .count
        .to_a
    end

    def filter_valid_keys(
      grouped_answers,
      question,
      slice_field
    )
      question_option_keys = question.options.map(&:key)
      slice_field_option_keys = slice_field.options.map(&:key)

      grouped_answers.select do |grouped_answer|
        answer = grouped_answer[:answer]
        group_by_value = grouped_answer[:group_by_value]

        valid_answer = answer.nil? || question_option_keys.include?(answer)
        valid_group_by_value = group_by_value.nil? || slice_field_option_keys.include?(group_by_value)

        valid_answer && valid_group_by_value
      end
    end

    def build_response(grouped_answers, question)
      {
        inputType: question.input_type,
        question: question.title_multiloc,
        required: question.required,
        totalResponses: grouped_answers.pluck(:count).sum,
        answers: grouped_answers,
        customFieldId: question.id
      }
    end
  end
end
