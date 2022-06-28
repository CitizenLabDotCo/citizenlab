# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class ParticipationsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: [:created]
      # after_action :verify_authorized, only: [:created]

      def create
        @analytics_query = QueryBuilderService.new(FactParticipation, params[:query])
        validation = @analytics_query.validate
        
        if validation["error"]
          render json: {"messages" => validation["messages"]}, status: validation["status"]
        end
      end
    end
  end
end
