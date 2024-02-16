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
      query = @inputs.select(select_query(question, as: 'answer'))

      # Group by
      grouped_answers_hash = apply_grouping(query)
        .each_with_object({}) do |(answer, count), accu|
          accu[answer] = { answer: answer, count: count }
        end

      # Construct answers array
      answer_keys = question.options.map(&:key) + [nil]

      answers = answer_keys.map do |key|
        grouped_answers_hash[key] || { answer: key, count: 0 }
      end

      # Build response
      build_response(answers, question, nil)
    end

    def slice_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      throw "Unsupported user field type: #{user_field.input_type}" unless user_field.input_type == 'select'

      # Join
      query = @inputs.joins(:author)

      # Select
      query = query.select(
        select_query(question, as: 'answer'),
        select_query(user_field, as: 'group_by_value')
      )

      # Group by
      grouped_answers_hash = group_answers(query)

      # Construct answers array
      answer_keys = question.options.map(&:key) + [nil]
      user_field_keys = user_field.options.map(&:key) + [nil]

      answers = answer_keys.map do |key|
        grouped_answer = grouped_answers_hash[key] || { answer: key, count: 0, groups: {} }

        answers_row = {
          answer: key,
          count: grouped_answer[:count],
          groups: user_field_keys.map do |user_key|
            grouped_answer[:groups][user_key] || { group: user_key, count: 0 }
          end
        }

        answers_row
      end

      build_response(answers, question, user_field)
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
      # grouped_answers = filter_valid_keys(grouped_answers, question, other_question)

      build_response(grouped_answers, question, other_question)
    end

    def get_multilocs(question, slice_field)
      multilocs = { answer: get_option_titles(question) }
      multilocs[:group_by_value] = get_option_titles(slice_field) if slice_field
      multilocs
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
      apply_grouping(answers, slice: true)
        .each_with_object({}) do |((answer, group_by_value), count), accu|
          accu[answer] ||= { answer: answer, count: 0, groups: {} }
          accu[answer][:count] += count
          accu[answer][:groups][group_by_value] = { group: group_by_value, count: count }
        end
    end

    def apply_grouping(answers, slice: false)
      Idea
        .select(:answer)
        .from(answers)
        .group(:answer, slice ? :group_by_value : nil)
        .count
    end

    def build_response(answers, question, slice_field)
      multilocs = get_multilocs(question, slice_field)

      {
        inputType: question.input_type,
        question: question.title_multiloc,
        required: question.required,
        totalResponses: answers.pluck(:count).sum,
        answers: answers,
        customFieldId: question.id,
        multilocs: multilocs
      }
    end

    def get_option_titles(field)
      field.options.each_with_object({}) do |option, accu|
        accu[option.key] = option.title_multiloc
      end
    end
  end
end
