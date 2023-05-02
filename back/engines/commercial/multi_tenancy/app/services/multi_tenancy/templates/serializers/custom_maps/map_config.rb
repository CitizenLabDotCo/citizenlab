# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module CustomMaps
        class MapConfig < Base
          ref_attribute :project
          attributes %i[center_geojson tile_provider]
          attribute(:zoom_level) { |map_config| map_config.zoom_level&.to_f }
        end
      end
    end
  end
end
