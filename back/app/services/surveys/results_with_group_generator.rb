# frozen_string_literal: true

module Surveys
  class ResultsWithGroupGenerator < ResultsWithDateGenerator
    def initialize(phase, group_mode: nil, group_field_id: nil, year: nil, quarter: nil)
      super(phase, year:, quarter:)
      @group_fields = group_mode == 'user_field' ? @user_fields : @input_fields
      @group_field_id = group_field_id
    end

    def generate_result_for_field(field_id)
      result = super(field_id)
      return result unless group_field_id

      # Find the fields and check they are supported
      field = input_fields.find { |f| f.id == field_id }
      group_field = group_fields.find { |f| f.id == group_field_id }
      group_field_key = group_field.resource_type == 'User' ? "u_#{group_field.key}" : group_field.key

      # binding.pry

      raise 'Group field not found' unless group_field
      raise "Unsupported group field type: #{group_field.input_type}" unless group_field.supports_single_selection?
      raise "Unsupported question type: #{field.input_type}" unless field.supports_selection?

      # Now add grouping info
      field_responses = select_field_answers(field.key, with_nil: true)
      group_responses = select_field_answers(group_field_key, with_nil: true).map { |r| [r[:id], r[:answer]] }.to_h

      # Base object to ensure ordering of groups is consistent
      group_keys = generate_select_answer_keys(group_field) + [nil]
      ordered_group_counts = group_keys.map { |key| [key, 0] }.to_h

      answers_with_groups = result[:answers].map do |result_answer|
        # Get the responses just for this answer
        answer_responses = field_responses.select { |fr| fr[:answer] == result_answer[:answer] }

        # Count the responses for the group field with the same ID
        group_counts = ordered_group_counts.deep_dup
        answer_responses.each do |answer_response, group_count|
          group_key = group_responses[answer_response[:id]]
          group_counts[group_key] += 1
        end

        # Reformat and remove groups with zero counts
        result_answer[:groups] = group_counts.filter_map { |group, count| !count.zero? ? { group:, count: } : nil }.compact
        result_answer
      end

      # binding.pry

      result[:grouped] = true
      result[:answers] = answers_with_groups
      result[:multilocs][:group] = get_option_multilocs(group_field)
      result[:legend] = group_keys
      result
    end

    # def generate_results
    #   # Grouping only allowed for individual questions currently
    #   raise NotImplementedError, 'This method is not implemented'
    # end

    private

    attr_reader :group_fields, :group_field_id

    # def core_field_attributes(field, response_count: nil)
    #   super.merge({
    #     grouped: !!group_field_id
    #   })
    # end

    # def visit_select_base(field)
    #   # query = inputs
    #   # query = query.joins(:author) if group_mode == 'user_field'
    #
    #   # raise "Unsupported group field type: #{group_field.input_type}" unless group_field.supports_single_selection?
    #   # raise "Unsupported question type: #{field.input_type}" unless field.supports_selection?
    #
    #   # query = query.select(
    #   #   select_field_query(field, as: 'answer'),
    #   #   select_field_query(group_field, as: 'group')
    #   # )
    #   # answers = construct_select_answers(query, field)
    #
    #
    #   # NEW: Currently with no grouping
    #
    #   group_field = input_fields.find { |f| f.id == group_field_id }
    #
    #   raise 'Question not found' unless group_field
    #   raise "Unsupported group field type: #{group_field.input_type}" unless group_field.supports_single_selection?
    #   raise "Unsupported question type: #{field.input_type}" unless field.supports_selection?
    #
    #   responses = select_field_answers(field.key)
    #   group_responses = select_field_answers(group_field.key).map { |r| [r[:id], r[:answer]] }.to_h
    #
    #   binding.pry
    #
    #   all_answers = responses.map { |a| a[:answer] }.uniq
    #
    #   result = all_answers.map do |ans|
    #     filtered = responses.select { |a| a[:answer] == ans }
    #     group_counts = filtered.each_with_object(Hash.new(0)) do |a, h|
    #       group = group_responses[a[:id]]
    #       h[group] += 1
    #     end
    #     {
    #       answer: ans,
    #       count: filtered.size,
    #       groups: group_counts.map { |group, count| { count: count, group: group } }
    #     }
    #   end
    #
    #   binding.pry
    #
    #
    #   # Count all the answers
    #   counts = responses.group_by { |h| h[:answer] }.transform_values(&:count)
    #
    #   # Build the result array with all required answers
    #   answer_keys = generate_select_answer_keys(field)
    #   answers = answer_keys.map { |a| { answer: a, count: counts[a] || 0 } }
    #
    #   # Add the nil counts
    #   answers << { answer: nil, count: nil_response_count(field) }
    #
    #   # Build response
    #   build_select_response(answers, field)
    # end

    # def build_select_response(answers, field)
    #   attributes = super
    #   attributes[:legend] = generate_select_answer_keys(group_field)
    #   attributes
    # end
    #
    # def construct_select_answers(query, question_field)
    #   answer_keys = generate_select_answer_keys(question_field)
    #   group_field_keys = generate_select_answer_keys(group_field)
    #
    #   # Create hash of grouped answers
    #   answer_groups = select_group_query(query, group: true)
    #   grouped_answers_hash = answer_groups
    #     .each_with_object({}) do |((answer, group), count), accu|
    #     # We treat 'faulty' values (i.e. that don't exist in options) as nil
    #     valid_answer = answer_keys.include?(answer) ? answer : nil
    #
    #     accu[valid_answer] ||= { answer: valid_answer, count: 0, groups: {} }
    #     accu[valid_answer][:count] += count
    #
    #     # Same for group
    #     valid_group = group_field_keys.include?(group) ? group : nil
    #
    #     accu[valid_answer][:groups][valid_group] ||= { group: valid_group, count: 0 }
    #     accu[valid_answer][:groups][valid_group][:count] += count
    #   end
    #
    #   # Construct answers array using order of custom field options
    #   answer_keys.map do |answer|
    #     grouped_answer = grouped_answers_hash[answer] || { answer: answer, count: 0, groups: {} }
    #
    #     answers_row = {
    #       answer: answer,
    #       count: grouped_answer[:count],
    #       groups: group_field_keys
    #         .filter { |group| grouped_answer[:groups][group] }
    #         .map { |group| grouped_answer[:groups][group] }
    #     }
    #
    #     answers_row
    #   end
    # end
    #
    # def select_group_query(query, group: false)
    #   Idea
    #     .select(:answer)
    #     .from(query)
    #     .group(:answer, group ? :group : nil)
    #     .count
    # end
    #
    # def get_multilocs(field)
    #   multilocs = super
    #   multilocs[:group] = get_option_multilocs(group_field)
    #   multilocs
    # end

    # def group_field
    #   find_question(group_field_id)
    # end
  end
end
