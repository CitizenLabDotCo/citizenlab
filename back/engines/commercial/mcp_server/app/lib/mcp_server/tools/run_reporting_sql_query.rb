# frozen_string_literal: true

# Runs a read-only reporting query written by the client AI against the curated
# reporting views. Validation and execution, including both sandbox layers, live in
# McpServer::ReportingQueryRunner.
class McpServer::Tools::RunReportingSqlQuery < McpServer::BaseTool
  ROW_LIMIT = McpServer::ReportingQueryRunner::ROW_LIMIT

  def name = 'run_reporting_sql_query'

  def annotations = READ_ANNOTATIONS

  def description
    <<~DOC.squish
      Runs a single read-only Postgres SELECT query against the reporting tables
      returned by the `get_reporting_sql_schema` tool, to answer reporting questions
      about participation, inputs, users, demographics and visitor traffic on the
      connected Go Vocal platform. Reference the reporting tables by their plain,
      unqualified names. All timestamps are in UTC. Count participants with
      COUNT(DISTINCT participant_id) on reporting_contributions. Not available in
      this model: emails, invitations, and participation through embedded
      third-party surveys or document annotation. At most #{ROW_LIMIT} rows
      are returned, so aggregate in SQL rather than fetching raw rows.
    DOC
  end

  def input_schema
    {
      properties: {
        query: {
          type: 'string',
          description: 'A single read-only SELECT statement over the reporting tables.'
        }
      },
      required: ['query']
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      result = McpServer::ReportingQueryRunner.run(params[:query].to_s)

      response(
        "Returned #{result.rows.size} row(s)" \
        "#{result.truncated ? " (truncated to #{ROW_LIMIT})" : ''}.",
        structured: {
          columns: result.columns,
          rows: result.rows,
          row_count: result.rows.size,
          truncated: result.truncated
        }
      )
    rescue McpServer::ReportingQueryRunner::Rejected => e
      error(e.message)
    rescue ActiveRecord::StatementInvalid => e
      error("Query execution failed: #{e.message}")
    end
  end
end
