# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class ParticipationsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: [:created]
      after_action :verify_authorized, only: [:created]

      def create
        query = QueryBuilderService.new(FactParticipation, params[:query])
        validation = query.validate

        if validation['messages'].empty?
          results = query.run
          render json: results
        else
          render json: { 'messages' => validation['messages'] }, status: :bad_request
        end
      end
    end
  end
end
