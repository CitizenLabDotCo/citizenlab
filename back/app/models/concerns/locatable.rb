module Locatable
  extend ActiveSupport::Concern

  included do
    scope :with_bounding_box, (Proc.new do |coordinates|
      x1,y1,x2,y2 = eval(coordinates)
      where("ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)", x1, y1, x2, y2)
    end)
  end

  def location_point_geojson
    RGeo::GeoJSON.encode(location_point) if location_point.present?
  end

  def location_point_geojson= geojson_point
    self.location_point = RGeo::GeoJSON.decode(geojson_point)
  end

  def latitude
    RGeo::GeoJSON.encode(location_point)&.dig('coordinates',1)
  end

  def longitude
    RGeo::GeoJSON.encode(location_point)&.dig('coordinates',0)
  end
end
