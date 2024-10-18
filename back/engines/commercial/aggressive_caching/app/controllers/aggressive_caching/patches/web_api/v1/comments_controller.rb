# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module CommentsController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_and_visitor? do
                caches_action :index, :children, expires_in: 1.minute, cache_path: -> { request.query_parameters }
                caches_action :show, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
