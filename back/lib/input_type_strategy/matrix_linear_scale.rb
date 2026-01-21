# frozen_string_literal: true

module InputTypeStrategy
  class MatrixLinearScale < Base
    def supports_linear_scale?
      true
    end

    def supports_matrix_statements?
      true
    end

    def supports_pdf_import?
      false
    end
  end
end
