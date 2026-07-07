# frozen_string_literal: true

class McpServer::Tools::GetReportingSqlSchema < McpServer::BaseTool
  # The single source of truth for which relations the reporting tools expose, held
  # as the analytics models that own them. Each model documents itself via
  # .table_description / .field_descriptions, and its .table_name is what the LLM
  # queries. The run_reporting_sql_query sandbox (McpServer::SqlSandboxer) and the
  # analytics_reader provisioner read REPORTING_TABLE_NAMES, so a table can never be
  # advertised but rejected, or vice versa.
  REPORTING_TABLES = [
    Analytics::FactParticipation,
    Analytics::DimensionDate,
    Analytics::DimensionProject,
    Analytics::DimensionType,
    Analytics::DimensionUser,
    Analytics::Reporting::Project,
    Analytics::Reporting::Phase,
    Analytics::Reporting::Session,
    Analytics::Reporting::Pageview,
    Analytics::Reporting::Contribution,
    Analytics::Reporting::Participant
  ].freeze

  REPORTING_TABLE_NAMES = REPORTING_TABLES.map(&:table_name).freeze

  def name = 'get_reporting_sql_schema'

  def description
    <<~DOC.squish
      Gets the SQL schema for the tables to run reporting queries against with the
      `run_reporting_sql_query` tool.
    DOC
  end

  def input_schema
    {
      properties: {
        table_names: {
          type: 'array',
          description: 'The names of the database tables to get the schema for. Optional, defaults to all tables.',
          items: {
            type: 'string',
            enum: REPORTING_TABLE_NAMES
          }
        }
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      requested = params[:table_names].presence
      models = REPORTING_TABLES.select { |model| requested.nil? || requested.include?(model.table_name) }
      connection = ActiveRecord::Base.connection

      schema = models.to_h do |model|
        field_docs = model.field_descriptions
        columns = connection.columns(model.table_name).map do |column|
          {
            name: column.name,
            type: column.sql_type,
            null: column.null,
            default: column.default,
            comment: field_docs[column.name]
          }
        end
        [model.table_name, { description: model.table_description, columns: columns }]
      end

      ok("SQL schema for #{schema.keys.join(', ')}", structured: schema)
    rescue ActiveRecord::StatementInvalid => e
      error("Error fetching schema: #{e.message}")
    end
  end
end
