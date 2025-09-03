# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module AdminPublicationsController
          def self.included(base)
            base.class_eval do
              # We can only cache for visitors, because permissions play a role in the admin publications shown
              with_options if: :caching_and_visitor? do
                caches_action :index, expires_in: 1.minute, cache_path: -> { request.query_parameters }
                caches_action :show, :status_counts, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
