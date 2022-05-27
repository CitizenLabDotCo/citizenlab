# frozen_string_literal: true

module Verification
  module Patches
    module WebApi
      module V1
        module UserSerializer
          def self.included(base)
            base.class_eval do
              attribute :verified, if: proc { |object, params|
                view_private_attributes? object, params
              }
            end
          end
        end
      end
    end
  end
end
