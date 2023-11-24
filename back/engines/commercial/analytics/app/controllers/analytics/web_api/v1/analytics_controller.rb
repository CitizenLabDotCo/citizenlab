# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index
      after_action :verify_authorized, only: :index
      def index
        handle_request(params[:query])
      end

      def create
        handle_request(params[:query])
      end

      def schema
        authorize :analytics, policy_class: AnalyticsPolicy
        if Query::MODELS.key? params[:fact].to_sym
          query = Query.new({ 'fact' => params[:fact] })
          render json: query.fact_attributes
        else
          render json: { 'messages' => ['Fact table does not exist'] }, status: :bad_request
        end
      end

      private

      def handle_request(query)
        authorize :analytics, policy_class: AnalyticsPolicy

        results, errors, paginations = Analytics::MultipleQueries.new(original_url: request.original_url).run(query)

        if errors.present?
          render json: { 'messages' => errors }, status: :bad_request
        else
          render json: { 'data' => { type: 'analytics', attributes: results }, 'links' => paginations }
        end
      end
    end
  end
end
