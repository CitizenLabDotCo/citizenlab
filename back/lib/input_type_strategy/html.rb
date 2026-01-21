# frozen_string_literal: true

module InputTypeStrategy
  class Html < Base
    def supports_printing?
      false
    end
  end
end
