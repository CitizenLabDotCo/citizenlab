# frozen_string_literal: true

class WebApi::V1::PostMarkerSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug, :location_point_geojson, :location_description, :upvotes_count, :downvotes_count, :comments_count

  attribute :budget, if: proc { |object, _| object.is_a?(Idea) } do |object|
    object.budget
  end
end
