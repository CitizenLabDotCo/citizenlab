# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module IdeaStatusesController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_and_non_admin? do
                caches_action :index, expires_in: 1.minute, cache_path: -> { request.query_parameters }
                caches_action :show, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
