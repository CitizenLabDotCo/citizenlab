# frozen_string_literal: true

module InputStrategy
  class ImageFiles < Base
    def supports_xlsx_export?
      false
    end

    def supports_geojson?
      false
    end
  end
end
