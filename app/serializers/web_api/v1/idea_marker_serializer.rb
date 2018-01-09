class WebApi::V1::IdeaMarkerSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :location_point_geojson, :location_description

  def location_point_geojson
    RGeo::GeoJSON.encode(object.location_point)
  end
end
