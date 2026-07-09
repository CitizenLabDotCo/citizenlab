# frozen_string_literal: true

require 'rails_helper'

# The reporting documentation now lives on the analytics models themselves
# (.table_description / .field_descriptions / .foreign_keys), served by the
# get_reporting_sql_schema tool. This guards against drift: every reporting model
# must document itself, its field descriptions must stay in lockstep with the live
# columns, and its foreign keys must all appear in the relationships map.
RSpec.describe 'Reporting schema documentation' do # rubocop:disable RSpec/DescribeClass
  # Columns that end in _id but deliberately have no reporting table to join to:
  # grouping keys, hashed identities, and ids of resources not exposed as tables.
  fk_exempt_columns = {
    'reporting_projects' => %w[folder_id],
    'reporting_sessions' => %w[anonymous_id visitor_id],
    'reporting_input_tags' => %w[tag_id parent_tag_id],
    'reporting_input_statuses' => %w[status_id],
    'reporting_user_question_answers' => %w[question_id],
    'reporting_input_question_answers' => %w[question_id]
  }

  reporting_tables = McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES

  reporting_tables.each do |model|
    describe model.name do
      it 'has a non-empty table description' do
        expect(model.table_description).to be_present
      end

      it 'documents every column, and no columns that no longer exist' do
        expect(model.field_descriptions.keys).to match_array(model.column_names)
      end

      it 'declares every foreign key column, or exempts it explicitly' do
        exempt = fk_exempt_columns.fetch(model.table_name, [])
        undeclared = model.column_names.grep(/_id\z/) - model.foreign_keys.keys - exempt

        expect(undeclared).to be_empty
      end

      it 'declares only existing columns as foreign keys, referencing live reporting columns' do
        expect(model.foreign_keys.keys - model.column_names).to be_empty

        model.foreign_keys.each_value do |target|
          references = target.scan(/(reporting_\w+)\.(\w+)/)
          expect(references).to be_present, "'#{target}' names no reporting_<table>.<column>"

          references.each do |table, column|
            target_model = reporting_tables.find { |m| m.table_name == table }
            expect(target_model).to be_present, "'#{target}' references unknown table #{table}"
            expect(target_model.column_names).to include(column)
          end
        end
      end
    end
  end
end
