class WebApi::V1::IdeaMarkerSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :location_point_geojson, :location_description

end
