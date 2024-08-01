# frozen_string_literal: true

module CustomMaps
  module Extensions
    module CustomField
      def self.included(base)
        base.attr_accessor :map_config_id

        base.has_one :map_config, class_name: 'CustomMaps::MapConfig', as: :mappable, dependent: :destroy
      end

      MAP_CONFIG_INPUT_TYPES = %w[point page].freeze

      def supports_map_config?
        MAP_CONFIG_INPUT_TYPES.include? input_type
      end
    end
  end
end
