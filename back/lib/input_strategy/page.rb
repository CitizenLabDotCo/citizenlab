# frozen_string_literal: true

module InputStrategy
  class Page < Base
    def structural_field?
      true
    end

    def supports_xlsx_export?
      false
    end

    def supports_geojson?
      false
    end
  end
end
