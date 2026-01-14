# frozen_string_literal: true

module InputStrategy
  class Checkbox < Base
    def supports_pdf_gpt_import?
      false
    end
  end
end
