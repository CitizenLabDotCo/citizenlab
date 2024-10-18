# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module IdeaStatusesController
          def self.included(base)
            base.class_eval do
              with_options if: :aggressive_caching_active? do
                caches_action :index, expires_in: 1.minute, cache_path: -> { params.to_s }
                caches_action :show, expires_in: 1.minute
              end
            end
          end

          def aggressive_caching_active?
            super && (!current_user || current_user.normal_user?)
          end
        end
      end
    end
  end
end
