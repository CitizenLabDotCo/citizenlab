# frozen_string_literal: true

module ProjectVisibility
  module Patches
    module WebApi
      module V1
        module ProjectSerializer
          def included(base)
            base.class_eval do
              attributes :visible_to
            end
          end
        end
      end
    end
  end
end
