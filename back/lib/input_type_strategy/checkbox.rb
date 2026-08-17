# frozen_string_literal: true

module InputTypeStrategy
  class Checkbox < Base
    def supports_reference_distribution?
      true
    end

    def answers_eq(answers, value)
      answers.where("(value #>> '{}')::boolean = ?", value)
    end
  end
end
