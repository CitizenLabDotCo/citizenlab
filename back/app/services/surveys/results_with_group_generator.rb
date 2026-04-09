# frozen_string_literal: true

module Surveys
  class ResultsWithGroupGenerator < ResultsWithDateGenerator
    def initialize(phase, group_mode: nil, group_field_id: nil, year: nil, quarter: nil, options_sort_order: 'count')
      super(phase, year:, quarter:, options_sort_order:)
      @group_mode = group_mode
      @group_field_id = group_field_id
    end

    def generate_result_for_field(field_id)
      super if group_field
    end

    def generate_results
      # Grouping only allowed for individual questions currently
      raise NotImplementedError, 'This method is not implemented'
    end

    private

    attr_reader :group_mode, :group_field_id

    def core_field_attributes(field, response_count: nil)
      super.merge({
        grouped: !!group_field_id
      })
    end

    def visit_select_base(field)
      query = inputs(field)
      query = query.left_joins(:author) if group_mode == 'user_field'

      raise "Unsupported group field type: #{group_field.input_type}" unless group_field.supports_single_selection?
      raise "Unsupported question type: #{field.input_type}" unless field.supports_selection?

      query = query.select(
        select_field_query(field, as: 'answer'),
        select_field_query(group_field, as: 'group')
      )
      answers = construct_select_answers(query, field)

      # Build response
      build_select_response(answers, field)
    end

    def build_select_response(answers, field)
      attributes = super
      attributes[:legend] = generate_select_answer_keys(group_field)
      attributes
    end

    def construct_select_answers(query, question_field)
      answer_keys = generate_select_answer_keys(question_field)
      group_field_keys = generate_select_answer_keys(group_field)

      # Create hash of grouped answers
      answer_groups = select_group_query(query, group: true)
      grouped_answers_hash = answer_groups
        .each_with_object({}) do |((answer, group), count), accu|
        # We treat 'faulty' values (i.e. that don't exist in options) as nil
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
          groups: group_field_keys
            .filter { |group| grouped_answer[:groups][group] }
            .map { |group| grouped_answer[:groups][group] }
        }

        answers_row
      end
    end

    def select_group_query(query, group: false)
      Idea
        .select(:answer)
        .from(query)
        .group(:answer, group ? :group : nil)
        .count
    end

    # Override to check for u_-prefixed demographic data on the idea first,
    # then fall back to the user's custom_field_values. This handles anonymous
    # surveys where demographic data is stored on the idea, not the user.
    def select_field_query(field, as: 'answer')
      if field.resource_type == 'User' && group_mode == 'user_field'
        prefixed_key = UserFieldsInFormService.prefix_key(field.key)

        if field.supports_single_selection?
          "COALESCE(ideas.custom_field_values->'#{prefixed_key}', users.custom_field_values->'#{field.key}', 'null') as #{as}"
        elsif field.supports_multiple_selection?
          %{
            jsonb_array_elements(
              CASE WHEN (
                jsonb_path_exists(ideas.custom_field_values, '$ ? (exists (@."#{prefixed_key}"))') AND
                jsonb_typeof(ideas.custom_field_values->'#{prefixed_key}') = 'array'
              ) THEN ideas.custom_field_values->'#{prefixed_key}'
              WHEN (
                jsonb_path_exists(users.custom_field_values, '$ ? (exists (@."#{field.key}"))') AND
                jsonb_typeof(users.custom_field_values->'#{field.key}') = 'array'
              ) THEN users.custom_field_values->'#{field.key}'
              ELSE '[null]'::jsonb END
            ) as #{as}
          }
        else
          raise "Unsupported field type: #{field.input_type}"
        end
      else
        super
      end
    end

    def get_multilocs(field)
      multilocs = super
      multilocs[:group] = get_option_multilocs(group_field)
      multilocs
    end

    def group_field
      @group_field ||= if group_mode == 'user_field'
        CustomField.find(group_field_id)
      else
        find_question(group_field_id)
      end
    end
  end
end
