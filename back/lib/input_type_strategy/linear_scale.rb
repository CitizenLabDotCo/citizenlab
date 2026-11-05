# frozen_string_literal: true

module InputTypeStrategy
  class LinearScale < Base
    INTEGER_VALUE = "(value #>> '{}')::integer"

    def supports_average?
      true
    end

    def supports_linear_scale?
      true
    end

    def supports_single_selection?
      true
    end

    def supports_logic?
      true
    end

    def answers_eq(answers, value)
      answers.where("#{INTEGER_VALUE} = ?", value)
    end

    def answers_one_of(answers, values)
      answers.where("#{INTEGER_VALUE} IN (?)", values)
    end

    def answers_gteq(answers, value)
      answers.where("#{INTEGER_VALUE} >= ?", value)
    end

    def answers_lteq(answers, value)
      answers.where("#{INTEGER_VALUE} <= ?", value)
    end
  end
end
