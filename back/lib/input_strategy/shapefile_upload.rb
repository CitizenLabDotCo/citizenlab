# frozen_string_literal: true

module InputStrategy
  class ShapefileUpload < Base
    def supports_xlsx_export?
      false
    end
  end
end
