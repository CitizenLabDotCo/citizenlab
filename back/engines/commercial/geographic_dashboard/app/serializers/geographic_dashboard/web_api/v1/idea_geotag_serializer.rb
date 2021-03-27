module GeographicDashboard
  class WebApi::V1::IdeaGeotagSerializer < ::WebApi::V1::BaseSerializer
    attribute :title_multiloc

    attribute :location_point_geojson do |object, params|
      if object.location_point.present?
        RGeo::GeoJSON.encode(object.location_point)
      elsif params[:geotags][object.id]
        geo = params[:geotags][object.id]
        factory = RGeo::Cartesian.factory
        RGeo::GeoJSON.encode(factory.point(geo['lon'], geo['lat']))
      end
    end

    attribute :location_description do |object, params|
      if object.location_description
        object.location_description
      elsif params[:geotags][object.id]
        params[:geotags][object.id]['address']
      end
    end
  end
end
