# frozen_string_literal: true

# Runs a read-only reporting query written by the client AI against the curated
# analytics views, behind a two-layer sandbox:
#
#   Layer 1 (McpServer::SqlSandboxer): a pg_query AST validator that accepts only
#   a single SELECT over unqualified analytics_fact_* / analytics_dimension_*
#   views with allowlisted functions. Returns an actionable rejection the model
#   can self-correct from.
#
#   Layer 2 (here): the real security boundary, enforced by Postgres. Each query
#   runs in a transaction under the `analytics_reader` role (SELECT only on the
#   analytics views), with `search_path` pinned to the current tenant schema and
#   resource limits set. All of it is `SET LOCAL`, so the role, search_path and
#   limits auto-revert when the transaction ends and the pooled connection
#   returns clean.
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
    'Runs a single read-only SELECT query against the reporting tables ' \
      '(see the `get_reporting_sql_schema` tool for the available tables and columns). ' \
      'Only analytics_fact_* / analytics_dimension_* tables may be referenced, unqualified. ' \
      "At most #{ROW_LIMIT} rows are returned."
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

    # Layer 2: execute under the restricted role, pinned to the tenant schema,
    # with resource limits. One validated statement per transaction.
    def execute(normalized_sql)
      conn = ActiveRecord::Base.connection
      result = nil

      conn.transaction(requires_new: true) do
        conn.execute("SET LOCAL statement_timeout = #{conn.quote(STATEMENT_TIMEOUT)}")
        conn.execute("SET LOCAL lock_timeout = #{conn.quote(LOCK_TIMEOUT)}")
        conn.execute("SET LOCAL work_mem = #{conn.quote(WORK_MEM)}")
        # Tenant schema only (no public): the analytics views live in the tenant
        # schema, and with layer 1 forbidding qualified names there is nothing
        # else for an unqualified reference to resolve to.
        conn.execute("SET LOCAL search_path TO #{conn.quote_column_name(tenant_schema)}")
        conn.execute("SET LOCAL ROLE #{conn.quote_column_name(ANALYTICS_READER_ROLE)}")

        capped_sql = "SELECT * FROM (#{normalized_sql}) mcp_reporting_query LIMIT #{ROW_LIMIT + 1}"
        result = conn.exec_query(capped_sql)
      end

      result
    end

    # The schema name comes from trusted tenant context, validated against the
    # known tenant list, never from model output.
    def tenant_schema
      schema = Apartment::Tenant.current
      unless Apartment.tenant_names.include?(schema)
        raise ActiveRecord::StatementInvalid, "No tenant context for reporting query (schema: #{schema})."
      end

      schema
    end
  end
end
