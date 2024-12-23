# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module ProjectCustomFieldsController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_and_visitor? do
                caches_action :json_forms_schema, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
