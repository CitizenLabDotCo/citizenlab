class MapConfigSerializer
  include FastJsonapi::ObjectSerializer

  attributes :project_id, :zoom_level, :tile_provider
  attribute :center, &:center_geojson

  has_many :layers
end
