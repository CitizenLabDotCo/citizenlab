# frozen_string_literal: true

module CustomMaps
  module Extensions
    module CustomField
      def self.included(base)
        base.has_one :map_config, class_name: 'CustomMaps::MapConfig', as: :mappable, dependent: :destroy
      end
    end
  end
end
