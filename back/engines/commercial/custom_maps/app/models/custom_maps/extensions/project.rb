module CustomMaps
  module Extensions
    module Project
      def self.included(base)
        base.has_one :map_config, class_name: 'CustomMaps::MapConfig', dependent: :destroy
      end
    end
  end
end
