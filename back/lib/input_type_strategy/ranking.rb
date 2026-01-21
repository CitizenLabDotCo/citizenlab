# frozen_string_literal: true

module InputTypeStrategy
  class Ranking < Base
    def supports_options?
      true
    end

    def supports_pdf_import?
      false
    end

    def supports_logic?
      true
    end
  end
end
