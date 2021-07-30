class WebApi::V1::EventSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :location_multiloc, :start_at, :end_at, :created_at, :updated_at, :location_point_geojson, :latitude, :longitude

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project
end
