# frozen_string_literal: true

module ReportBuilder
  module Composition
    # The reporting data model, rendered as compact text for the composer's prompt.
    #
    # Same source as the MCP reporting schema tool — the documented views, their
    # column comments and their foreign keys — so the SQL a report block writes and
    # the SQL an MCP client writes are held to one description of the data.
    module ReportingSchema
      def self.to_prompt_text
        tables = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES
        connection = ActiveRecord::Base.connection

        sections = tables.map { |model| table_section(model, connection) }
        "#{sections.join("\n")}\n#{relationships_section(tables)}"
      end

      def self.table_section(model, connection)
        field_docs = model.field_descriptions
        columns = connection.columns(model.table_name).map do |column|
          doc = field_docs[column.name]
          "  #{column.name} #{column.sql_type}#{doc.present? ? " — #{doc}" : ''}"
        end

        "#{model.table_name}: #{model.table_description}\n#{columns.join("\n")}\n"
      end
      private_class_method :table_section

      def self.relationships_section(tables)
        joins = tables.filter_map do |model|
          next if model.foreign_keys.blank?

          keys = model.foreign_keys.map { |column, target| "#{column} -> #{target}" }
          "  #{model.table_name}: #{keys.join(', ')}"
        end

        "How they join:\n#{joins.join("\n")}"
      end
      private_class_method :relationships_section
    end
  end
end
