# frozen_string_literal: true

module Survey
  class ResultsWithGroupGenerator < ResultsGenerator
    def initialize(phase, group_mode: nil, group_field_id: nil)
      super(phase)
      @group_mode = group_mode
      @group_field_id = group_field_id
      # TODO: JS - Return an error unless group is present
    end

    def generate_result_for_field(field_id)
      raise 'Group question not found' unless group_field

      super(field_id)
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
      query = inputs
      query = query.joins(:author) if group_mode == 'user_field'

      raise "Unsupported group field type: #{group_field.input_type}" unless %w[select linear_scale rating].include?(group_field.input_type)
      raise "Unsupported question type: #{field.input_type}" unless %w[select multiselect linear_scale rating multiselect_image].include?(field.input_type)

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
      attributes[:legend] = generate_answer_keys(group_field)
      attributes
    end

    def construct_select_answers(query, question_field)
      answer_keys = generate_answer_keys(question_field)
      group_field_keys = generate_answer_keys(group_field)

      # Create hash of grouped answers
      answer_groups = group_query(query, group: true)
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

    def group_query(query, group: false)
      Idea
        .select(:answer)
        .from(query)
        .group(:answer, group ? :group : nil)
        .count
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
