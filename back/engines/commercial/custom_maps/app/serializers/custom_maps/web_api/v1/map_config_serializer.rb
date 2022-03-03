class CustomMaps::WebApi::V1::MapConfigSerializer < ::WebApi::V1::BaseSerializer
  attributes :zoom_level, :tile_provider, :center_geojson
  belongs_to :project

  attribute :layers do |map_config, _params|
    map_config.layers.map do |layer|
      {
        default_enabled: layer.default_enabled,
        geojson: layer.geojson,
        id: layer.id,
        marker_svg_url: layer.marker_svg_url,
        ordering: layer.ordering,
        title_multiloc: layer.title_multiloc
      }
    end
  end

  attribute :legend do |map_config|
    map_config.legend_items.map do |legend_item|
      {
        color: legend_item.color,
        title_multiloc: legend_item.title_multiloc
      }
    end
  end
end
