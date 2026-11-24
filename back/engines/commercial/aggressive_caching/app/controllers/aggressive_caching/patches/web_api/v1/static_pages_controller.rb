# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module StaticPagesController
          def self.included(base)
            base.class_eval do
              # A cached response is served without the policy check. A project's page is only
              # visible to users who can see the project, so only visitors, who all see the
              # same, share a cached copy.
              with_options if: :caching_and_visitor? do
                caches_action :index, expires_in: 1.minute, cache_path: -> { request.query_parameters }
                caches_action :show, :by_slug, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
