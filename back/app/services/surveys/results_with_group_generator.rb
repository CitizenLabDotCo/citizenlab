# frozen_string_literal: true

module Surveys
  class ResultsWithGroupGenerator < ResultsWithDateGenerator
    def initialize(phase, group_mode: nil, group_field_id: nil, year: nil, quarter: nil)
      super(phase, year:, quarter:)
      @group_mode = group_mode
      @group_field_id = group_field_id
    end

    def generate_result_for_field(field_id)
      result = super
      return result unless group_field_id

      # Find the survey field and check if supported
      field = input_fields.find { |f| f.id == field_id }
      raise "Unsupported question type: #{field.input_type}" unless field.supports_selection?

      # Find the group field and check if supported
      group_field = group_fields.find { |f| f.id == group_field_id }
      raise 'Group field not found' unless group_field
      raise "Unsupported group field type: #{group_field.input_type}" unless group_field.supports_single_selection?

      # Now add grouping info
      group_field_key = group_by_user_field? ? "u_#{group_field.key}" : group_field.key
      field_responses = select_field_answers(field.key, with_nil: true)
      group_responses = select_field_answers(group_field_key, with_nil: true).to_h { |r| [r[:id], r[:answer]] }

      # Base object to ensure ordering of groups is consistent
      group_keys = generate_select_answer_keys(group_field) + [nil]
      ordered_group_counts = group_keys.index_with { |_key| 0 }

      answers_with_groups = result[:answers].map do |result_answer|
        # Get the responses just for this answer
        answer_responses = field_responses.select { |fr| fr[:answer] == result_answer[:answer] }

        # Count the responses for the group field with the same ID
        group_counts = ordered_group_counts.deep_dup
        answer_responses.each do |answer_response|
          group_key = group_responses[answer_response[:id]]
          group_counts[group_key] += 1
        end

        # Reformat and remove groups with zero counts
        result_answer[:groups] = group_counts.filter_map { |group, count| count.zero? ? nil : { group:, count: } }.compact
        result_answer
      end

      result[:grouped] = true
      result[:answers] = answers_with_groups
      result[:multilocs][:group] = get_option_multilocs(group_field)
      result[:legend] = group_keys
      result
    end

    private

    attr_reader :group_mode, :group_field_id

    def group_by_user_field?
      group_mode == 'user_field'
    end

    def group_fields
      @group_fields ||= group_by_user_field? ? user_fields : input_fields
    end
  end
end
