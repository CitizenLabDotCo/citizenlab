# frozen_string_literal: true

module AggressiveCaching
  module Patches
    module WebApi
      module V1
        module IdeaFeed
          module IdeasController
            def self.included(base)
              base.class_eval do
                caches_action :index,
                  expires_in: 1.minute,
                  cache_path: -> { cache_path },
                  if: :caching_idea_feed?

                def caching_idea_feed?
                  caching_and_visitor?
                end

                # The main special thing about this cache_path is that it
                # includes the IDs of ExposedIdeas. Since the endpoint is likely
                # to trigger the same order of ideas for most people browsing at
                # the same time, or at least at the start of their browsing, it
                # can make a big difference, at the expense of a more
                # expensive cache key calculation.
                def cache_path
                  {
                    topics: params[:topics],
                    page_size: page_size,
                    phase: params[:id],
                    exposure_ids: exposure_ids.sort
                  }
                end

                def exposure_ids
                  @exposure_ids ||= ::IdeaFeed::FeedService.new(
                    @phase,
                    user: nil, # We only cache for visitors
                    visitor_hash: VisitorHashService.new.generate_for_request(request)
                  ).exposures_scope.pluck(:id)
                end
              end
            end
          end
        end
      end
    end
  end
end
