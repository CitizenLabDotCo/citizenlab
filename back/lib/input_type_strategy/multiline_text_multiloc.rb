# frozen_string_literal: true

module InputTypeStrategy
  class MultilineTextMultiloc < Base
    def supports_text?
      true
    end

    def supports_printing?
      false
    end
  end
end
