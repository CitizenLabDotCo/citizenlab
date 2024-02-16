# frozen_string_literal: true

module ReportBuilder
  class SurveyResponseGrouper
    def initialize(phase)
      @form = phase.custom_form || CustomForm.new(participation_context: phase)
      @inputs = phase.ideas.published
    end

    def get_result(question_field_id)
      question = get_question(question_field_id)

      query = @inputs.select(select_query(question, as: 'answer'))

      answer_keys = question.options.map(&:key) + [nil]

      grouped_answers_hash = apply_grouping(query)
        .each_with_object({}) do |(answer, count), accu|
          valid_answer = answer_keys.include?(answer) ? answer : nil

          accu[valid_answer] ||= { answer: valid_answer, count: 0 }
          accu[valid_answer][:count] += count
        end

      answers = answer_keys.map do |key|
        grouped_answers_hash[key] || { answer: key, count: 0 }
      end

      # Build response
      build_response(answers, question, nil)
    end

    def group_by_user_field(question_field_id, user_field_id)
      question = get_question(question_field_id)
      user_field = CustomField.find_by(id: user_field_id)
      throw "Unsupported user field type: #{user_field.input_type}" unless user_field.input_type == 'select'

      query = @inputs.joins(:author)

      query = query.select(
        select_query(question, as: 'answer'),
        select_query(user_field, as: 'group')
      )

      answers = construct_answers(query, question, user_field)

      build_response(answers, question, user_field)
    end

    def group_by_other_question(question_field_id, other_question_field_id)
      question = get_question(question_field_id)
      other_question = get_question(other_question_field_id)
      throw "Unsupported question type: #{other_question.input_type}" unless other_question.input_type == 'select'

      query = @inputs.select(
        select_query(question, as: 'answer'),
        select_query(other_question, as: 'group')
      )

      answers = construct_answers(query, question, other_question)

      build_response(answers, question, other_question)
    end

    def get_multilocs(question, group_field)
      multilocs = { answer: get_option_titles(question) }
      multilocs[:group] = get_option_titles(group_field) if group_field
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

    def construct_answers(query, question, group_field)
      answer_keys = question.options.map(&:key) + [nil]
      group_field_keys = group_field.options.map(&:key) + [nil]

      # Create hash of grouped answers
      grouped_answers_hash = apply_grouping(query, group: true)
        .each_with_object({}) do |((answer, group), count), accu|
          # We treat 'faulthy' values (i.e. that don't exist in options) as nil
          valid_answer = answer_keys.include?(answer) ? answer : nil

          accu[valid_answer] ||= { answer: valid_answer, count: 0, groups: {} }
          accu[valid_answer][:count] += count

          # Same for group
          valid_group = group_field_keys.include?(group) ? group : nil

          accu[valid_answer][:groups][valid_group] ||= { group: valid_group, count: 0 }
          accu[valid_answer][:groups][valid_group][:count] += count
        end

      # Construct answers array using order of custom field options
      answer_keys.map do |answer|
        grouped_answer = grouped_answers_hash[answer] || { answer: answer, count: 0, groups: {} }

        answers_row = {
          answer: answer,
          count: grouped_answer[:count],
          groups: group_field_keys.map do |group|
            grouped_answer[:groups][group] || { group: group, count: 0 }
          end
        }

        answers_row
      end
    end

    def apply_grouping(query, group: false)
      Idea
        .select(:answer)
        .from(query)
        .group(:answer, group ? :group : nil)
        .count
    end

    def build_response(answers, question, group_field)
      multilocs = get_multilocs(question, group_field)

      {
        inputType: question.input_type,
        question: question.title_multiloc,
        required: question.required,
        grouped: !!group_field,
        totalResponses: @inputs.count,
        totalPicks: answers.pluck(:count).sum,
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
