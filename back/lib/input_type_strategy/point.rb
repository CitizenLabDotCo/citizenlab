# frozen_string_literal: true

module InputTypeStrategy
  class Point < Base
    def supports_pdf_import?
      false
    end

    def supports_xlsx_import?
      false
    end
  end
end
