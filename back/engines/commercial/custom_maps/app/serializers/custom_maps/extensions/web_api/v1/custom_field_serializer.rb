# frozen_string_literal: true

module CustomMaps
  module Extensions
    module WebApi
      module V1
        module CustomFieldSerializer
          def self.included(base)
            base.class_eval do
              has_one :map_config, class_name: 'CustomMaps::MapConfig', as: :mappable,
                serializer: ::CustomMaps::WebApi::V1::MapConfigSerializer,
                if: proc { |object| CustomField::MAP_CONFIG_INPUT_TYPES.include? object.input_type }
            end
          end
        end
      end
    end
  end
end
