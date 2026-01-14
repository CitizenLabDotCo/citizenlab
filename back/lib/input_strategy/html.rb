# frozen_string_literal: true

module InputStrategy
  class Html < Base
    def supports_printing?
      false
    end
  end
end
