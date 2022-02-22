class CustomMaps::WebApi::V1::MapConfigSerializer < ::WebApi::V1::BaseSerializer
  attributes :zoom_level, :tile_provider, :center_geojson
  belongs_to :project

  has_many :layers
  has_many :legend_items
end
