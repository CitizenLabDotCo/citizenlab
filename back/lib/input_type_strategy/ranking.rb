# frozen_string_literal: true

module InputTypeStrategy
  class Ranking < Base
    def supports_options?
      true
    end

    def supports_pdf_import?
      true
    end

    def supports_logic?
      true
    end

    def logic_operators
      %w[present absent]
    end
  end
end
