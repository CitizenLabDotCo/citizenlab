# frozen_string_literal: true

# This mixin assumes that the including class has a `location_point` attribute
# that is a Point geometry.
module GeoJsonHelpers
  extend ActiveSupport::Concern

  def location_point_geojson
    RGeo::GeoJSON.encode(location_point) if location_point.present?
  end

  def location_point_geojson=(geojson_point)
    self.location_point = RGeo::GeoJSON.decode(geojson_point)
  end
end
