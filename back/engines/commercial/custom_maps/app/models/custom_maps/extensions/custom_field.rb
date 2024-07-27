# frozen_string_literal: true

module CustomMaps
  module Extensions
    module CustomField
      def self.included(base)
        base.attr_accessor :map_config_id

        base.has_one :map_config, class_name: 'CustomMaps::MapConfig', as: :mappable, dependent: :destroy
      end
      GEOGRAPHIC_INPUT_TYPES = %w[point line polygon].freeze
      MAP_CONFIG_INPUT_TYPES = GEOGRAPHIC_INPUT_TYPES # This will soon also include input_type: 'page'

      def geographic?
        GEOGRAPHIC_INPUT_TYPES.include? input_type
      end

      def supports_map_config?
        MAP_CONFIG_INPUT_TYPES.include? input_type
      end
    end
  end
end
