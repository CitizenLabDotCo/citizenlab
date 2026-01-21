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
  end
end
