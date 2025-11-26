# frozen_string_literal: true

module InputStrategy
  class MatrixLinearScale < Base
    def supports_linear_scale?
      true
    end

    def supports_linear_scale_labels?
      true
    end

    def supports_matrix_statements?
      true
    end
  end
end
