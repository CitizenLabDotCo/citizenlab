# frozen_string_literal: true

module InputTypeStrategy
  class MultiselectImage < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_option_images?
      true
    end

    def supports_multiple_selection?
      true
    end

    def supports_select_count?
      true
    end

    def answers_present(answers)
      answers.where("value != '[]'::jsonb")
    end

    def answers_one_of(answers, values)
      answers.where('value ?| array[:values]', values: values)
    end
  end
end
