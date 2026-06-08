# frozen_string_literal: true

class McpServer::Tools::GetReportingSqlSchema < McpServer::BaseTool
  # The single source of truth for which tables the reporting tools expose. Both
  # this schema tool and the run_reporting_sql_query sandbox (McpServer::SqlSandboxer)
  # read from here, so a table can never be advertised but rejected, or vice versa.
  # Currently: the participations fact plus the dimensions it joins to.
  REPORTING_TABLES = %w[
    analytics_fact_participations
    analytics_dimension_dates
    analytics_dimension_projects
    analytics_dimension_types
    analytics_dimension_users
  ].freeze

  def name = 'get_reporting_sql_schema'
  def description = 'Gets the SQL schema for the tables to run reporting queries against with the `run_reporting_sql_query` tool. Optionally, specify the names of the tables to get the schema for those specific tables only.'

  def input_schema
    {
      properties: {
        table_names: {
          type: 'array',
          description: 'The names of the database tables to get the schema for (optional)',
          items: {
            type: 'string',
            enum: REPORTING_TABLES
          }
        }
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      requested = params[:table_names].presence || REPORTING_TABLES
      table_names = REPORTING_TABLES & requested
      connection = ActiveRecord::Base.connection

      schema = table_names.index_with do |table_name|
        {
          description: relation_comment(connection, table_name),
          columns: connection.columns(table_name).map do |column|
            {
              name: column.name,
              type: column.sql_type,
              null: column.null,
              default: column.default,
              comment: column.comment
            }
          end
        }
      end

      ok("SQL schema for #{table_names.join(', ')}", structured: schema)
    rescue ActiveRecord::StatementInvalid => e
      error("Error fetching schema: #{e.message}")
    end

    private

    # The relation-level comment. We can't use connection.table_comment: it filters
    # to base tables, so it returns nil for the dimension/fact VIEWS. obj_description
    # over the regclass works for tables and views alike, resolved via search_path.
    def relation_comment(connection, table_name)
      connection.select_value("SELECT obj_description(#{connection.quote(table_name)}::regclass, 'pg_class')")
    end
  end
end
