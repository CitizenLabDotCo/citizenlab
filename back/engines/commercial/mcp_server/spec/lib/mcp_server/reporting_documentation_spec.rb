# frozen_string_literal: true

require 'rails_helper'

# The reporting documentation now lives on the analytics models themselves
# (.table_description / .field_descriptions), served by the get_reporting_sql_schema
# tool. This guards against drift: every reporting model must document itself, and
# its field descriptions must stay in lockstep with the live columns.
RSpec.describe 'Reporting schema documentation' do # rubocop:disable RSpec/DescribeClass
  McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.each do |model|
    describe model.name do
      it 'has a non-empty table description' do
        expect(model.table_description).to be_present
      end

      it 'documents every column, and no columns that no longer exist' do
        expect(model.field_descriptions.keys).to match_array(model.column_names)
      end
    end
  end
end
