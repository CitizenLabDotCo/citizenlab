class Maps::WebApi::V1::MapConfigSerializer < ::WebApi::V1::BaseSerializer
  attributes :zoom_level, :tile_provider, :center_geojson

  attribute :layers do |map_config, params|
    map_config.layers.map do |layer|
      {
        title_multiloc: layer.title_multiloc,
        geojson: layer.geojson,
        legend: layer.legend_items.map do |legend_item|
          {
            title_multiloc: legend_item.title_multiloc,
            color: legend_item.color
          }
        end
      }
    end
  end
end
