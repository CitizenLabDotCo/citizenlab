# frozen_string_literal: true

module InputTypeStrategy
  class Text < Base
    def supports_text?
      true
    end

    def json_schema
      { type: 'string' }
    end

    def answers_eq(answers, value)
      answers.where("value #>> '{}' = ?", value)
    end

    def answers_matching(answers, pattern)
      answers.where("value #>> '{}' LIKE ?", pattern)
    end
  end
end
