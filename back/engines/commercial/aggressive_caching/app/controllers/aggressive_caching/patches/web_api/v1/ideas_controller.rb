# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module IdeasController
          def self.included(base)
            base.class_eval do
              with_options if: :aggressive_caching_active? do
                # We need an extra :skip_after_action here, because the
                # IdeasController re-specifies the after_action hook explicitly
                # and takes precedence
                skip_after_action :verify_policy_scoped

                caches_action :index, :index_mini, :filter_counts, expires_in: 1.minute, cache_path: -> { params.to_s }
                caches_action :show, :by_slug, expires_in: 1.minute
              end
              caches_action :json_forms_schema, expires_in: 1.day, if: :aggressive_caching_active_and_not_admin?
            end
          end

          # We don't cache ideas for normal users, since they might post/change ideas
          def aggressive_caching_active?
            super && !current_user
          end

          # But we do cache the json_forms_schema for normal users, since they can't impact it
          def aggressive_caching_active_and_not_admin?
            AppConfiguration.instance.feature_activated?('aggressive_caching') && (!current_user || current_user.normal_user?)
          end
        end
      end
    end
  end
end
