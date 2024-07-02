# frozen_string_literal: true

module CustomMaps
  module Extensions
    module CustomField
      def self.included(base)
        base.attr_accessor :map_config_id

        base.has_one :map_config, class_name: 'CustomMaps::MapConfig', as: :mappable, dependent: :destroy
      end

      def supports_map_config?
        input_type == 'point' || input_type == "line" || input_type == "polygon"
      end
    end
  end
end
