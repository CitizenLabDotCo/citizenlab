# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Runs one reporting query for a custom block, through the same sandbox the
      # MCP reporting tool uses.
      class ReportingQueriesController < ::ApplicationController
        def create
          authorize :reporting_query, policy_class: ReportingQueryPolicy

          query = params.require(:query)
          result = McpServer::ReportingQueryRunner.run(query)

          render json: {
            data: {
              # The query is the identity: two blocks asking the same question are
              # the same result, and the front-end caches on it.
              id: Digest::SHA256.hexdigest(query),
              type: 'reporting_query',
              attributes: {
                columns: result.columns,
                rows: result.rows,
                truncated: result.truncated
              }
            }
          }
        rescue McpServer::ReportingQueryRunner::Rejected => e
          render json: { errors: { query: [{ error: 'rejected', detail: e.message }] } },
            status: :unprocessable_entity
        rescue ActiveRecord::StatementInvalid => e
          render json: { errors: { query: [{ error: 'execution_failed', detail: e.message }] } },
            status: :unprocessable_entity
        end
      end
    end
  end
end
