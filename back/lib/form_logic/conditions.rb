# frozen_string_literal: true

module FormLogic
  # Evaluates one compiled condition against answers. Mirrored by
  # front/app/utils/formLogic/interpret.ts (`matches`); both are pinned by
  # back/spec/fixtures/form_logic/programs.json.
  module Conditions
    OPERATORS = %w[present absent eq one_of none_of contains_any contains_all gt gte lt lte].freeze

    module_function

    def match?(condition, answers)
      return condition['all'].all? { |c| match?(c, answers) } if condition.key?('all')
      return condition['any'].any? { |c| match?(c, answers) } if condition.key?('any')
      return !match?(condition['not'], answers) if condition.key?('not')

      leaf?(condition, answers[condition['key']])
    end

    def present?(value)
      !(value.nil? || value == '' || value == [])
    end

    def leaf?(condition, value)
      expected = condition['value']

      case condition['op']
      when 'present' then present?(value)
      when 'absent' then !present?(value)
      when 'eq' then present?(value) && value == expected
      when 'one_of' then present?(value) && expected.include?(value)
      when 'none_of' then present?(value) && !expected.include?(value)
      when 'contains_any' then value.is_a?(Array) && value.intersect?(expected)
      when 'contains_all' then value.is_a?(Array) && (expected - value).empty?
      when 'gt' then value.is_a?(Numeric) && value > expected
      when 'gte' then value.is_a?(Numeric) && value >= expected
      when 'lt' then value.is_a?(Numeric) && value < expected
      when 'lte' then value.is_a?(Numeric) && value <= expected
      else raise InvalidProgram, "Unknown operator #{condition['op'].inspect}"
      end
    end
  end
end
