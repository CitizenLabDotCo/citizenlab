# frozen_string_literal: true

module SmartGroups
  module Extensions
    module WebApi
      module V1
        module GroupSerializer
          def self.included(base)
            base.class_eval do
              attributes :creation_source

              attribute :rules, if: proc { |object| object.rules? }
            end
          end
        end
      end
    end
  end
end
