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
  end
end
