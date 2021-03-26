module GeographicDashboard
  module WebApi
    module V1
      class GeotaggedIdeasController < ApplicationController
        delegate :geotag, to: :geotag_service

        def index
          @ideas = policy_scope(Idea)
                   .page(params.dig(:page, :number))
                   .per(params.dig(:page, :size))
                   .where(location_point: nil)

          render json: serialized_geotagged_ideas, status: :ok
        end

        private

        def serialized_geotagged_ideas
          linked_json(
            @ideas,
            WebApi::V1::IdeaGeotagSerializer,
            params: fastjson_params(geotags: idea_geotags)
          )
        end

        def idea_geotags
          @ideas.map { |idea| [idea.id, geotag(Tenant.current.id, idea, geocoder: 'google')] }.to_h
        end

        def geotag_service
          @geotag_service ||= GeotagService.new
        end
      end
    end
  end
end
