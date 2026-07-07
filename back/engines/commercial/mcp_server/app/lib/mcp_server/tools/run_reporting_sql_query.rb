# frozen_string_literal: true

# Runs a read-only reporting query written by the client AI against the curated
# reporting views, behind a two-layer sandbox:
#
#   Layer 1 (McpServer::SqlSandboxer): a pg_query AST validator that accepts only
#   a single SELECT over the unqualified whitelisted reporting views with
#   allowlisted functions. Returns an actionable rejection the LLM
#   can self-correct from.
#
#   Layer 2 (here): the real security boundary, enforced by Postgres. Each query
#   runs in a transaction under the `analytics_reader` role (SELECT only on the
#   reporting views), with resource limits set. Apartment has already pinned
#   `search_path` to the current tenant schema, so unqualified names resolve there;
#   we only assert up front that we are in a real tenant. The role and limits are
#   `SET LOCAL`, so they auto-revert when the transaction ends and the pooled
#   connection returns clean.
#
# NOTE: layer 2 depends on the `analytics_reader` role and its per-tenant-schema
# grants existing in the database. Until that provisioning migration lands, valid
# queries fail closed with a clear "role not provisioned" error rather than
# running with the app's full privileges.
class McpServer::Tools::RunReportingSqlQuery < McpServer::BaseTool
  ANALYTICS_READER_ROLE = 'analytics_reader'
  ROW_LIMIT = 1000
  STATEMENT_TIMEOUT = '10s'
  LOCK_TIMEOUT = '1s'
  WORK_MEM = '64MB'

  def name = 'run_reporting_sql_query'

  def description
    <<~DOC.squish
      Runs a single read-only Postgres SELECT query against the reporting tables
      returned by the `get_reporting_sql_schema` tool, to answer reporting questions
      about participation, inputs, users, demographics and visitor traffic on the
      connected Go Vocal platform. Reference the reporting tables by their plain,
      unqualified names. All timestamps are in UTC. Count participants with
      COUNT(DISTINCT participant_id) on reporting_contributions. Not available in
      this model: emails, invitations, events as entities, and participation through
      embedded third-party surveys or document annotation. At most #{ROW_LIMIT} rows
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
      query = params[:query].to_s
      return error('A non-empty `query` is required.') if query.blank?

      validation = McpServer::SqlSandboxer.validate(query)
      return error("Query rejected: #{validation.error}") unless validation.valid?

      result = execute(validation.normalized_sql)
      rows = result.to_a
      truncated = rows.size > ROW_LIMIT
      rows = rows.first(ROW_LIMIT)

      ok(
        "Returned #{rows.size} row(s)#{truncated ? " (truncated to #{ROW_LIMIT})" : ''}.",
        structured: { columns: result.columns, rows: rows, row_count: rows.size, truncated: truncated }
      )
    rescue ActiveRecord::StatementInvalid => e
      error("Query execution failed: #{e.message}")
    end

    private

    # Layer 2: execute under the restricted role with resource limits. Apartment
    # has already pinned search_path to the current tenant schema, so unqualified
    # names resolve there; we just assert we are in a real tenant first. One
    # validated statement per transaction.
    def execute(normalized_sql)
      ensure_tenant_context!
      conn = ActiveRecord::Base.connection
      result = nil

      conn.transaction(requires_new: true) do
        conn.execute("SET LOCAL statement_timeout = #{conn.quote(STATEMENT_TIMEOUT)}")
        conn.execute("SET LOCAL lock_timeout = #{conn.quote(LOCK_TIMEOUT)}")
        conn.execute("SET LOCAL work_mem = #{conn.quote(WORK_MEM)}")
        conn.execute("SET LOCAL ROLE #{conn.quote_column_name(ANALYTICS_READER_ROLE)}")

        capped_sql = "SELECT * FROM (#{normalized_sql}) mcp_reporting_query LIMIT #{ROW_LIMIT + 1}"
        result = conn.exec_query(capped_sql)
      end

      result
    end

    # Refuse to run outside a real tenant. Apartment normally pins the connection to
    # the request's tenant schema; this guards the edge case (e.g. a public-schema
    # context) where the tool would otherwise query the shared/public reporting views.
    def ensure_tenant_context!
      schema = Apartment::Tenant.current
      return if Apartment.tenant_names.include?(schema)

      raise ActiveRecord::StatementInvalid, "No tenant context for reporting query (schema: #{schema})."
    end
  end
end
