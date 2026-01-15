# frozen_string_literal: true

module InputTypeStrategy
  class MultilineText < Base
    def supports_text?
      true
    end
  end
end
