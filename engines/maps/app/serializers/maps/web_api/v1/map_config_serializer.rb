class Maps::WebApi::V1::MapConfigSerializer < ::WebApi::V1::BaseSerializer
  attributes :zoom_level, :tile_provider

  attribute :center_point_geojson do |map_config, params|
    RGeo::GeoJSON.encode(map_config.center) if map_config.center.present?
  end

  attribute :layers do |map_config, params|
    map_config.layers.map do |layer|
      {
        title_multiloc: layer.title_multiloc,
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
