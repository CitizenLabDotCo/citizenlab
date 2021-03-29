module SmartGroups
  module Extensions
    module WebApi
      module V1
        module GroupSerializer
          def self.included(base)
            base.class_eval do
              attribute :rules, if: proc { |object| object.rules? }
            end
          end
        end
      end
    end
  end
end
