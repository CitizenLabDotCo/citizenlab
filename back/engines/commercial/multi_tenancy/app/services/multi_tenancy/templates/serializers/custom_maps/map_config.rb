# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module CustomMaps
        class MapConfig < Base
          ref_attribute :mappable
          attributes %i[center_geojson tile_provider esri_web_map_id esri_base_map_id]

          attribute(:zoom_level) { |map_config| map_config.zoom_level&.to_f }
        end
      end
    end
  end
end
