# frozen_string_literal: true

module InputTypeStrategy
  class Select < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_single_selection?
      true
    end

    def supports_dropdown_layout?
      true
    end

    def supports_reference_distribution?
      true
    end

    def supports_logic?
      true
    end

    def json_schema
      schema = { type: 'string' }
      option_keys = custom_field.ordered_transformed_options.map(&:key)
      option_keys.empty? ? schema : schema.merge(enum: option_keys)
    end

    def answers_eq(answers, value)
      answers.where("value #>> '{}' = ?", value)
    end

    def answers_one_of(answers, values)
      answers.where("value #>> '{}' IN (?)", values)
    end
  end
end
