# frozen_string_literal: true

class McpServer::Tools::GetReportingSqlSchema < McpServer::BaseTool
  # The single source of truth for which relations the reporting tools expose, held
  # as the analytics models that own them. Each model documents itself via
  # .table_description / .field_descriptions, and its .table_name is what the LLM
  # queries. The run_reporting_sql_query sandbox (McpServer::SqlSandboxer) and the
  # analytics_reader provisioner read REPORTING_TABLE_NAMES, so a table can never be
  # advertised but rejected, or vice versa.
  REPORTING_TABLES = [
    Analytics::Reporting::Project,
    Analytics::Reporting::Phase,
    Analytics::Reporting::Session,
    Analytics::Reporting::Pageview,
    Analytics::Reporting::Contribution,
    Analytics::Reporting::Participant,
    Analytics::Reporting::Input,
    Analytics::Reporting::InputTag,
    Analytics::Reporting::InputVote,
    Analytics::Reporting::InputReaction,
    Analytics::Reporting::User,
    Analytics::Reporting::UserQuestionAnswer,
    Analytics::Reporting::InputQuestionAnswer
  ].freeze

  REPORTING_TABLE_NAMES = REPORTING_TABLES.map(&:table_name).freeze

  def name = 'get_reporting_sql_schema'

  def annotations = READ_ANNOTATIONS

  def description
    <<~DOC.squish
      Gets the SQL schema of the reporting tables that the `run_reporting_sql_query`
      tool can query: a documented relational model of the platform's participation
      data (contributions and participants, inputs with their answers, tags, statuses,
      votes and reactions, users with their demographics, visitor sessions and
      pageviews, projects and phases). Call this before writing SQL; the returned
      table and column comments carry the semantics queries should follow, and the
      relationships map shows how the tables join.
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

      tables = models.to_h do |model|
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

      response("SQL schema for #{tables.keys.join(', ')}", structured: { tables: tables, relationships: relationships })
    rescue ActiveRecord::StatementInvalid => e
      error("Error fetching schema: #{e.message}")
    end

    private

    # A compact ERD: per table, its foreign keys as column -> referenced
    # table.column (declared by each model's .foreign_keys, guarded against
    # drift by reporting_documentation_spec). Always returned in full, even
    # for a filtered call: cross-table context is exactly what a subset lacks.
    def relationships
      REPORTING_TABLES.filter_map do |model|
        [model.table_name, model.foreign_keys] if model.foreign_keys.any?
      end.to_h
    end
  end
end
