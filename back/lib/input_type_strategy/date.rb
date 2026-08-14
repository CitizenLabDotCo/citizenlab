# frozen_string_literal: true

module InputTypeStrategy
  class Date < Base
    def answers_one_of(answers, values)
      answers.where("value #>> '{}' IN (?)", values)
    end

    def answers_before(answers, value)
      answers.where("(value #>> '{}')::date < (?)::date", value)
    end

    def answers_after(answers, value)
      answers.where("(value #>> '{}')::date > (?)::date", value)
    end

    def answers_on(answers, value)
      answers.where("(value #>> '{}')::date >= (?)::date AND (value #>> '{}')::date < ((?)::date + '1 day'::interval)", value, value)
    end
  end
end
