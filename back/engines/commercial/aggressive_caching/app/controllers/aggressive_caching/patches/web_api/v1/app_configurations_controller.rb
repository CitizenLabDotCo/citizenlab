# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module AppConfigurationsController
          def self.included(base)
            base.class_eval do
              skip_after_action :verify_authorized, only: [:show], if: :aggressive_caching_enabled?

              caches_action :show, expires_in: 1.minute, if: lambda {
                aggressive_caching_enabled? && (!current_user || current_user.highest_role == 'user')
              }
            end
          end
        end
      end
    end
  end
end
