# frozen_string_literal: true

module InputTypeStrategy
  class Html < Base
    def supports_printing?
      false
    end

    def json_schema
      { type: 'string' }
    end
  end
end
