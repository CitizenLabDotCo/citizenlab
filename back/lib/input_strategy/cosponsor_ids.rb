# frozen_string_literal: true

module InputStrategy
  class CosponsorIds < Base
    def supports_printing?
      false
    end

    def supports_xlsx_import?
      false
    end
  end
end
