# frozen_string_literal: true

module FormLogic
  # Evaluates one compiled condition against answers keyed by field id. Mirrored by
  # front/app/utils/formLogic/walkSurvey.ts (`matches`); both are pinned by the shared
  # fixtures in back/spec/fixtures/form_logic/walker.
  #
  # Every operator returns false (never raises) for answers or values of the wrong type, so
  # Ruby and JavaScript cannot disagree on comparisons that one of them would coerce.
  module Conditions
    OPERATORS = %w[present absent eq one_of none_of contains_any contains_all gt gte lt lte].freeze
    NUMERIC_OPERATORS = %w[gt gte lt lte].freeze
    LIST_OPERATORS = %w[one_of none_of contains_any contains_all].freeze

    module_function

    def match?(condition, answers)
      return condition['all'].all? { |c| match?(c, answers) } if condition.key?('all')
      return condition['any'].any? { |c| match?(c, answers) } if condition.key?('any')
      return !match?(condition['not'], answers) if condition.key?('not')

      leaf?(condition['op'], answers[condition['field']], condition['value'])
    end

    def present?(value)
      !(value.nil? || value == '' || value == [] || value == {})
    end

    def scalar?(value)
      value.is_a?(String) || number?(value) || value == true || value == false
    end

    def present_scalar?(value)
      scalar?(value) && present?(value)
    end

    def scalar_list?(value)
      value.is_a?(Array) && value.all? { |v| scalar?(v) }
    end

    def number?(value)
      value.is_a?(Integer) || value.is_a?(Float)
    end

    def leaf?(operator, value, expected)
      case operator
      when 'present' then present?(value)
      when 'absent' then !present?(value)
      when 'eq' then scalar?(expected) && scalar?(value) && value == expected
      when 'one_of', 'none_of' then choice?(operator, value, expected)
      when 'contains_any', 'contains_all' then contains?(operator, value, expected)
      when *NUMERIC_OPERATORS then number?(value) && number?(expected) && compare(operator, value, expected)
      else raise InvalidProgram, "Unknown operator #{operator.inspect}"
      end
    end

    def choice?(operator, value, expected)
      return false unless scalar_list?(expected) && present_scalar?(value)

      operator == 'one_of' ? expected.include?(value) : expected.exclude?(value)
    end

    def contains?(operator, value, expected)
      return false unless scalar_list?(expected) && value.is_a?(Array)
      return value.any? { |v| scalar?(v) && expected.include?(v) } if operator == 'contains_any'

      expected.all? { |e| value.include?(e) }
    end

    def compare(operator, value, expected)
      case operator
      when 'gt' then value > expected
      when 'gte' then value >= expected
      when 'lt' then value < expected
      when 'lte' then value <= expected
      end
    end
  end
end
