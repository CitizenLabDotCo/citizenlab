# frozen_string_literal: true

module InputTypeStrategy
  class Multiselect < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_multiple_selection?
      true
    end

    def supports_select_count?
      true
    end

    def supports_dropdown_layout?
      true
    end

    def supports_reference_distribution?
      true
    end

    def json_schema
      items = { type: 'string' }
      option_keys = custom_field.ordered_options.map(&:key)
      items[:enum] = option_keys if !option_keys.empty?

      { type: 'array', uniqueItems: true, items: items }
    end

    def cast_xlsx_value(_value)
      nil
    end

    def answers_present(answers)
      answers.where("value != '[]'::jsonb")
    end

    # Equality for a set answer means the option is selected, whatever else is.
    def answers_eq(answers, value)
      answers.where('value ? :value', value: value)
    end

    def answers_one_of(answers, values)
      answers.where('value ?| array[:values]', values: values)
    end
  end
end
