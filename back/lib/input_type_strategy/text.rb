# frozen_string_literal: true

module InputTypeStrategy
  class Text < Base
    def supports_text?
      true
    end
  end
end
