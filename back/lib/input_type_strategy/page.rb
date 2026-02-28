# frozen_string_literal: true

module InputTypeStrategy
  class Page < Base
    def page?
      true
    end

    def supports_xlsx_export?
      false
    end

    def supports_geojson?
      false
    end

    def supports_pdf_llm_import?
      false
    end

    def supports_xlsx_import?
      false
    end

    def supports_logic?
      true
    end
  end
end
