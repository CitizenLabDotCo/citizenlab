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

              # A cached response is served without the policy check. A layout is only as
              # visible as its project, folder or page, which can depend on the user, so only
              # visitors, who all see the same, share a cached copy. The homepage layout is the
              # same for everyone.
              def caching_layout?
                params[:content_buildable] == 'HomePage' ? caching_and_non_admin? : caching_and_visitor?
              end
            end
          end
        end
      end
    end
  end
end
