# frozen_string_literal: true

module InputStrategy
  class CosponsorIds < Base
    def supports_xlsx_export?
      false
    end
  end
end
