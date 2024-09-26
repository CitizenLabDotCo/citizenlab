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

  # Using the WGS84 reference system (srid: 4326) for consistency with AppConfiguration#location,
  # even though currently there's no interaction between this method and AppConfiguration#location.
  # https://en.wikipedia.org/wiki/World_Geodetic_System#:~:text=method.%5B3%5D-,WGS,-84
  def wkt_string_to_geojson(wkt_string)
    rgeo_object = RGeo::Geographic.spherical_factory(srid: 4326).parse_wkt(wkt_string)

    RGeo::GeoJSON.encode(rgeo_object)
  end
end
