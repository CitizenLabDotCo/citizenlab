# frozen_string_literal: true

class MapConfigSerializer
  include JSONAPI::Serializer

  attributes :project_id, :zoom_level, :tile_provider
  attribute :center, &:center_geojson

  has_many :layers
end
