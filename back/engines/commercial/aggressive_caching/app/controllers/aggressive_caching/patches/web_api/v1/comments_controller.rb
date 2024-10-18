# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module CommentsController
          def self.included(base)
            base.class_eval do
              with_options if: :aggressive_caching_active? do
                caches_action :index, :children, expires_in: 1.minute, cache_path: -> { params.to_s }
                caches_action :show, expires_in: 1.minute
              end
            end
          end

          # We don't cache comments for normal users, since they might post/change
          def aggressive_caching_active?
            super && !current_user
          end
        end
      end
    end
  end
end
