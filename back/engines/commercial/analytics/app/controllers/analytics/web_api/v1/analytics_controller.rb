# frozen_string_literal: true

require 'query'

module Analytics
  module WebApi::V1
    class AnalyticsController < ::ApplicationController
      def create
        authorize :analytics, policy_class: AnalyticsPolicy

        if params[:query].instance_of?(Array)
          results, errors, response_status, success = handle_multiple(params[:query])
        else
          results, errors, response_status, success = handle_single(params[:query])
        end

        if success
          render json: { 'data' => results }
        else
          render json: { 'messages' => errors }, status: response_status
        end
      end

      private

      def handle_single(json_query)
        results = nil
        errors = nil
        response_status = nil
        success = nil

        query = Query.new(json_query)
        query.validate

        if query.valid
          query.run
          unless query.failed
            success = true
            results = query.results
          end
        end

        if !query.valid || query.failed
          success = false
          errors = query.error_messages
          response_status = query.response_status
        end

        [results, errors, response_status, success]
      end

      def handle_multiple(json_queries)
        all_valid = true
        all_succeded = true
        success = true
        results = []
        errors = {}
        statuses = []
        queries = []

        json_queries.each_with_index do |json_query, index|
          query = Query.new(json_query)
          queries.push(query)
          query.validate
          next if query.valid

          errors[index] = query.error_messages
          statuses.push(query.response_status)
          all_valid = false
        end

        if all_valid
          queries.each_with_index do |query, index|
            query.run
            if query.failed
              errors[index] = query.error_messages
              all_succeded = false
              statuses.push(500)
            else
              results.push(query.results)
            end
          end
        end

        if !all_valid || !all_succeded
          success = false
          response_status = statuses.max
        end

        [results, errors, response_status, success]
      end
    end
  end
end
