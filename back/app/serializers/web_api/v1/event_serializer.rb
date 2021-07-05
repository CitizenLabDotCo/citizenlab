class WebApi::V1::EventSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :location_multiloc, :start_at, :end_at, :created_at, :updated_at, :location_point_geojson

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project

  def latitude
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',1)
  end

  def longitude
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',0)
  end
end
