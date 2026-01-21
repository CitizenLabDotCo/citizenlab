# frozen_string_literal: true

module InputTypeStrategy
  class LinearScale < Base
    def supports_average?
      true
    end

    def supports_linear_scale?
      true
    end

    def supports_single_selection?
      true
    end

    def supports_logic?
      true
    end
  end
end
