# frozen_string_literal: true

class CustomMaps::WebApi::V1::MapConfigSerializer < WebApi::V1::BaseSerializer
  attributes :zoom_level, :tile_provider, :center_geojson
  belongs_to :project, serializer: WebApi::V1::ProjectSerializer

  attribute :layers do |map_config, _params|
    map_config.layers.map do |layer|
      {
        title_multiloc: layer.title_multiloc,
        geojson: layer.geojson,
        default_enabled: layer.default_enabled,
        marker_svg_url: layer.marker_svg_url,
        id: layer.id
      }
    end
  end

  attribute :legend do |map_config|
    map_config.legend_items.map do |legend_item|
      {
        title_multiloc: legend_item.title_multiloc,
        color: legend_item.color
      }
    end
  end
end
