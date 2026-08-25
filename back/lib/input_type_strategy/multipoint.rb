# frozen_string_literal: true

module InputTypeStrategy
  class Multipoint < Base
    def supports_pdf_import?
      false
    end

    def supports_xlsx_import?
      false
    end

    def supports_select_count?
      true
    end
  end
end
