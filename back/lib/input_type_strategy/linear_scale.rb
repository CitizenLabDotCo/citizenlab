# frozen_string_literal: true

module InputStrategy
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
  end
end
