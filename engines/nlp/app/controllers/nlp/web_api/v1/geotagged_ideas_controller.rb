module NLP
  module WebApi
    module V1
      class GeotaggedIdeasController < ApplicationController

        def index
          @ideas = policy_scope(Idea)
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))

          geotagging = NLP::GeotagService.new
          geotags = @ideas.where('location_point IS NULL').map do |idea|
            [idea.id, geotagging.geotag(Tenant.current.id, idea)]
          end.to_h

          render json: @ideas, each_serializer: ::WebApi::V1::IdeaGeotagSerializer, geotags: geotags
        end


        private

        def secure_controller?
          false
        end

      end
    end
  end
end
