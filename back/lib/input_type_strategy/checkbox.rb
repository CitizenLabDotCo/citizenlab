# frozen_string_literal: true

module InputTypeStrategy
  class Checkbox < Base
    def supports_reference_distribution?
      true
    end

    def json_schema
      { type: 'boolean' }
    end

    def cast_xlsx_value(value)
      Utils.to_bool(value)
    end

    def answers_eq(answers, value)
      answers.where("(value #>> '{}')::boolean = ?", value)
    end
  end
end
