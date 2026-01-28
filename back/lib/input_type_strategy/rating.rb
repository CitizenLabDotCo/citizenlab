# frozen_string_literal: true

module InputTypeStrategy
  class Rating < Base
    def supports_average?
      true
    end

    def supports_linear_scale?
      true
    end

    def supports_linear_scale_labels?
      false
    end

    def supports_single_selection?
      true
    end
  end
end
