# frozen_string_literal: true

require 'query'

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: :index
      after_action :verify_authorized, only: :index
      def index
        handle_request
      end

      def create
        handle_request
      end

      private

      def handle_request
        authorize :analytics, policy_class: AnalyticsPolicy

        results, errors = handle_multiple(Array.wrap(params[:query]))

        unless params[:query].instance_of?(Array)
          results = results.empty? ? results : results[0]
          errors = errors.key?(0) ? errors[0] : errors
        end

        if errors.present?
          render json: { 'messages' => errors }, status: :bad_request
        else
          render json: { 'data' => results }
        end
      end

      def handle_multiple(json_queries)
        results = []
        errors = {}
        queries = []

        json_queries.each_with_index do |json_query, index|
          query = Query.new(json_query)
          queries.push(query)
          query.validate
          next if query.valid

          errors[index] = query.error_messages
        end

        if errors.blank?
          queries.each_with_index do |query, index|
            query.run
            if query.failed
              errors[index] = query.error_messages
            else
              results.push(query.results)
            end
          end
        end

        [results, errors]
      end
    end
  end
end
