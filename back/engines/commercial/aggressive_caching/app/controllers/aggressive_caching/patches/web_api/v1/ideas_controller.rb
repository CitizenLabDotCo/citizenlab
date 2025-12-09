# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module IdeasController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_and_visitor? do
                # We need an extra :skip_after_action here, because the
                # IdeasController re-specifies the after_action hook explicitly
                # and takes precedence
                skip_after_action :verify_policy_scoped

                caches_action :index, :index_mini, :filter_counts, :index_idea_markers, expires_in: 1.minute, cache_path: -> { request.query_parameters }
                caches_action :show, :by_slug, expires_in: 1.minute
              end
            end
          end
        end
      end
    end
  end
end
