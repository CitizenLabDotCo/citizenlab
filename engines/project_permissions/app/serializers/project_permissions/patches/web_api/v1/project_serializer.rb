# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module WebApi
      module V1
        module ProjectSerializer
          def self.included(base)
            base.class_eval do
              attributes :visible_to
            end
          end
        end
      end
    end
  end
end
