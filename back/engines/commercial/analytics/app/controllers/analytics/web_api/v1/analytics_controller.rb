# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      def create
        authorize :analytics, policy_class: AnalyticsPolicy

        query = QueryBuilderService.new(params[:query])
        validation = query.validate

        if validation['messages'].empty?
          results = query.run
          render json: { 'data' => results }
        else
          render json: { 'messages' => validation['messages'] }, status: :bad_request
        end
      end
    end
  end
end
