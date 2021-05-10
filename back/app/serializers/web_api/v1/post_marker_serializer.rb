class WebApi::V1::PostMarkerSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :location_point_geojson, :location_description, :upvotes_count, :downvotes_count, :comments_count

end
