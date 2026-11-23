# frozen_string_literal: true

module InputTypeStrategy
  class Number < Base
    def supports_average?
      true
    end

    def supports_reference_distribution?
      custom_field.code == 'birthyear'
    end

    def json_schema
      return { type: 'number' } if custom_field.code != 'birthyear'

      min_age = AppConfiguration.instance.settings('core', 'min_user_age') || 12
      { type: 'number', enum: (1900..(Time.now.year - min_age)).to_a.reverse }
    end

    def cast_xlsx_value(value)
      Utils.to_number(value)
    end

    # Number inputs in the browser yield strings ("1963"). Strings that aren't
    # numbers are kept as is, so answer validation still rejects them.
    def normalize_value(value)
      return value if !value.is_a?(String)

      Integer(value, 10, exception: false) || Float(value, exception: false) || value
    end

    def answers_eq(answers, value)
      answers.where("(value #>> '{}')::float = ?", value)
    end

    def answers_one_of(answers, values)
      answers.where("(value #>> '{}')::integer IN (?)", values)
    end

    def answers_gt(answers, value)
      answers.where("(value #>> '{}')::float > ?", value)
    end

    def answers_gteq(answers, value)
      answers.where("(value #>> '{}')::float >= ?", value)
    end

    def answers_lt(answers, value)
      answers.where("(value #>> '{}')::float < ?", value)
    end

    def answers_lteq(answers, value)
      answers.where("(value #>> '{}')::float <= ?", value)
    end

    def answers_minimum(answers)
      answers.minimum("(value #>> '{}')::integer")
    end

    def answers_maximum(answers)
      answers.maximum("(value #>> '{}')::integer")
    end
  end
end
