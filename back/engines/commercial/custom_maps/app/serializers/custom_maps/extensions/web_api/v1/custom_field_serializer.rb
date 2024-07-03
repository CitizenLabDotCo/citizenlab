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
                if: proc { |object| object.input_type == 'point' || object.input_type == 'line' || object.input_type == 'polygon'}
            end
          end
        end
      end
    end
  end
end
