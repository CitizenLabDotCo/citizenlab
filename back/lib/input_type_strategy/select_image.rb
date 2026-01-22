# frozen_string_literal: true

module InputTypeStrategy
  class SelectImage < Base
    def supports_options?
      true
    end

    def supports_other_option?
      true
    end

    def supports_option_images?
      true
    end

    def supports_single_selection?
      true
    end

    def supports_printing?
      false
    end
  end
end
