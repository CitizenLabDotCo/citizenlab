# frozen_string_literal: true

module McpServer
  # Runs one read-only reporting query behind the two-layer sandbox, for any caller
  # that lets an LLM write SQL: the MCP tool, and the custom blocks in a report.
  #
  #   Layer 1 (McpServer::SqlSandboxer): a pg_query AST validator that accepts only a
  #   single SELECT over the unqualified whitelisted reporting views with allowlisted
  #   functions, and rejects with a message the model can correct itself from.
  #
  #   Layer 2 (here): enforced by Postgres, but it rests on layer 1. The query runs in
  #   a transaction under the `analytics_reader` role (SELECT only on the reporting
  #   views) with a statement and lock timeout. The role is shared by every tenant:
  #   Apartment's `search_path` and layer 1's ban on qualified names are what keep a
  #   query inside its own tenant, and we assert up front that we are in one. Layer 1's
  #   function allowlist is also what stops a query resetting the role through
  #   `set_config`. The settings are `SET LOCAL`, so the block rolls back to drop them
  #   when it returns, rather than leaving them on a caller's transaction.
  class ReportingQueryRunner
    class Rejected < StandardError; end

    ANALYTICS_READER_ROLE = 'analytics_reader'
    ROW_LIMIT = 1000
    STATEMENT_TIMEOUT = '10s'
    LOCK_TIMEOUT = '1s'
    WORK_MEM = '64MB'

    Result = Data.define(:columns, :rows, :truncated)

    # @raise [Rejected] if the query is not a valid sandboxed reporting query. The
    #   message is written for the model that wrote the query.
    # @raise [ActiveRecord::StatementInvalid] if Postgres refuses to run it.
    # @raise [RuntimeError] if there is no tenant to run it in.
    def self.run(query)
      new(query).run
    end

    # Validates without running, for callers that store a query to run later.
    # @return [String] the normalized SQL.
    # @raise [Rejected]
    def self.validate!(query)
      raise Rejected, 'A non-empty query is required.' if query.blank?

      validation = SqlSandboxer.validate(query)
      raise Rejected, "Query rejected: #{validation.error}" unless validation.valid?

      validation.normalized_sql
    end

    def initialize(query)
      @query = query
    end

    def run
      result = execute(self.class.validate!(@query))
      rows = result.to_a
      truncated = rows.size > ROW_LIMIT

      Result.new(columns: result.columns, rows: rows.first(ROW_LIMIT), truncated: truncated)
    end

    private

    def execute(normalized_sql)
      ensure_tenant_context!
      conn = ActiveRecord::Base.connection
      result = nil

      conn.transaction(requires_new: true) do
        conn.execute("SET LOCAL statement_timeout = #{conn.quote(STATEMENT_TIMEOUT)}")
        conn.execute("SET LOCAL lock_timeout = #{conn.quote(LOCK_TIMEOUT)}")
        conn.execute("SET LOCAL work_mem = #{conn.quote(WORK_MEM)}")
        conn.execute("SET LOCAL ROLE #{conn.quote_column_name(ANALYTICS_READER_ROLE)}")

        capped_sql = "SELECT * FROM (#{normalized_sql}) reporting_query LIMIT #{ROW_LIMIT + 1}"
        result = conn.exec_query(capped_sql)
        # Roll back rather than commit. Inside an outer transaction this block is only
        # a savepoint, and releasing one leaves the role and the timeouts in force for
        # whatever the caller runs next. The query reads, so nothing is lost.
        raise ActiveRecord::Rollback
      end

      result
    end

    # Refuse to run outside a real tenant. Apartment normally pins the connection to
    # the request's tenant schema; this guards the edge case (e.g. a public-schema
    # context) where the query would otherwise hit the shared reporting views.
    def ensure_tenant_context!
      return if Tenant.safe_current

      raise "No tenant context for reporting query (schema: #{Apartment::Tenant.current})."
    end
  end
end
