# frozen_string_literal: true

module McpServer
  # Limits a reporting query to the rows of a McpServer::QueryScope, by putting a
  # common table expression (CTE), a named `WITH` subquery, with the name of each
  # reporting view in front of it. The query may only name the views unqualified
  # (SqlSandboxer), so Postgres resolves every name in it to our CTE, also inside its
  # own subqueries and CTEs. Each CTE reads the real view by its schema-qualified
  # name, through the view's project rule (Analytics::Reporting::ScopedView).
  #
  # NOT MATERIALIZED lets Postgres push the filters down into the views, and skip
  # the CTEs the query does not use.
  class ReportingScopeWrapper
    def initialize(scope, connection: ActiveRecord::Base.connection)
      @scope = scope
      @connection = connection
    end

    def wrap(sql)
      return sql if @scope.all?

      ctes = Tools::GetReportingSqlSchema::REPORTING_TABLES.map do |model|
        view = @connection.quote_table_name(model.table_name)
        # An admin-only view gets a CTE with no rows. The sandbox already refuses its
        # name for this scope; this keeps the name from reaching the real view if it
        # ever gets past the sandbox.
        relation = model.admin_only? ? model.where('false') : model.for_projects(@scope.project_ids)
        "#{view} AS NOT MATERIALIZED (#{relation.from("#{schema}.#{view} #{view}").to_sql})"
      end
      "WITH #{ctes.join(",\n")}\n#{sql}"
    end

    private

    def schema = @connection.quote_table_name(Apartment::Tenant.current)
  end
end
