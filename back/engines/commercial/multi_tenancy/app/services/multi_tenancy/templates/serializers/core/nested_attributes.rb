module MultiTenancy
  module Templates
    module Serializers
      module Core
        class NestedAttributes
          def initialize(attrs)
            @attrs = attrs
          end

          def resolve(context)
            @attrs.transform_values do |value|
              if value.is_a?(Ref)
                value.resolve(context)
              else
                value
              end
            end
          end
        end
      end
    end
  end
end
