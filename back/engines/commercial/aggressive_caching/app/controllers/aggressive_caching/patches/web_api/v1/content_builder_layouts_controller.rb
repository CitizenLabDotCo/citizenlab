# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module ContentBuilderLayoutsController
          def self.included(base)
            base.class_eval do
              with_options if: :caching_layout? do
                caches_action :show, expires_in: 1.minute
              end

              private

              # A cached response is served without the policy check. A static page's layout is
              # only as visible as the page, which for a project's page depends on the user, so
              # only visitors, who all see the same, share a cached copy.
              def caching_layout?
                params[:content_buildable] == 'StaticPage' ? caching_and_visitor? : caching_and_non_admin?
              end
            end
          end
        end
      end
    end
  end
end
