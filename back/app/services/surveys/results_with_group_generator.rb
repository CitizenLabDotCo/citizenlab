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

      query = query
        .joins(answers_join(field, as: 'answer'))
        .joins(group_answers_joins)
        .select(select_field_query(field, as: 'answer'), group_select_query)
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
      answer_groups = select_group_query(query)
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

    def select_group_query(query)
      Idea
        .select(:answer)
        .from(query)
        .group(:answer, :group)
        .count(:all)
    end

    def answers_join(field, as:, key: field.key, table: 'ideas')
      <<~SQL.squish
        LEFT JOIN custom_field_answers #{as}_cfa
        ON #{as}_cfa.answerable_id = #{table}.id
        AND #{as}_cfa.custom_field_id = '#{field.id}'
        AND #{as}_cfa.key = '#{key}'
      SQL
    end

    def group_answers_joins
      if group_mode == 'user_field'
        [
          answers_join(group_field, as: 'group_idea', key: UserFieldsInFormService.prefix_key(group_field.key)),
          answers_join(group_field, as: 'group_user', table: 'users')
        ]
      else
        [answers_join(group_field, as: 'group')]
      end
    end

    def select_field_query(field, as: 'answer')
      if field.supports_single_selection?
        "#{as}_cfa.value as #{as}"
      elsif field.supports_multiple_selection?
        %{
          jsonb_array_elements(
            CASE WHEN jsonb_typeof(#{as}_cfa.value) = 'array'
            THEN #{as}_cfa.value ELSE '[null]'::jsonb END
          ) as #{as}
        }
      else
        raise "Unsupported field type: #{field.input_type}"
      end
    end

    # The demographic answer of the input's author, preferring the u_-prefixed
    # copy on the input itself, which anonymous surveys store instead.
    def group_select_query
      if group_mode == 'user_field'
        'COALESCE(group_idea_cfa.value, group_user_cfa.value) as group'
      else
        select_field_query(group_field, as: 'group')
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
