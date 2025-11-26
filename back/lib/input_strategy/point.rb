# frozen_string_literal: true

module InputStrategy
  class Point < Base
    def supports_xlsx_export?
      false
    end

    def supports_geojson?
      true
    end
  end
end
