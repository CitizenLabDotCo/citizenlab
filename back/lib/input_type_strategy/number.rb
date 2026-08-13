# frozen_string_literal: true

module InputTypeStrategy
  class Number < Base
    def supports_average?
      true
    end

    def supports_reference_distribution?
      custom_field.code == 'birthyear'
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
