class WebApi::V1::IdeaGeotagSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :location_point_geojson, :location_description

  def location_point_geojson
    if object.location_point.present?
      RGeo::GeoJSON.encode(object.location_point)
    elsif @instance_options[:geotags][object.id]
      geo = @instance_options[:geotags][object.id]
      factory = RGeo::Cartesian.factory
      RGeo::GeoJSON.encode(factory.point(geo['lon'], geo['lat']))
    end
  end

  def location_description
    if object.location_description 
      object.location_description
    elsif @instance_options[:geotags][object.id]
      @instance_options[:geotags][object.id]['address']
    end
  end
end
