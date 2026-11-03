# frozen_string_literal: true

module InputTypeStrategy
  class Geographic < Base
    def supports_pdf_import?
      false
    end

    def supports_xlsx_import?
      false
    end

    # The FE submits WKT strings because GeoJSON's nested arrays are rejected by strong params.
    def normalize_value(value)
      return value if !value.is_a?(String)

      RGeo::GeoJSON.encode(RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(value))
    end
  end
end
