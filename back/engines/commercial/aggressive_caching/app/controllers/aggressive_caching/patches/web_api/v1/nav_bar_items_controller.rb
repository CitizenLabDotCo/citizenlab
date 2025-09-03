# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module NavBarItemsController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_and_non_admin? do
                skip_after_action :verify_policy_scoped
                caches_action :index, expires_in: 1.minute, cache_path: -> { request.query_parameters }
              end
            end
          end
        end
      end
    end
  end
end
