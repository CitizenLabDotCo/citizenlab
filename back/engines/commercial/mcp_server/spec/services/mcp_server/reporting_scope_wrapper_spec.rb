# frozen_string_literal: true

require 'rails_helper'

# What a scoped query reads is covered end to end in reporting_query_runner_spec.
RSpec.describe McpServer::ReportingScopeWrapper do
  let(:sql) { 'SELECT count(*) FROM reporting_inputs' }

  it 'leaves the query unchanged for every row' do
    expect(described_class.new(McpServer::QueryScope.all).wrap(sql)).to eq sql
  end

  it 'puts a CTE for each view in front of the query, with no rows for the admin-only ones' do
    scope = McpServer::QueryScope.new(project_ids: [])
    wrapped = described_class.new(scope).wrap(sql)

    McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES.each do |model|
      expect(wrapped).to include(%("#{model.table_name}" AS NOT MATERIALIZED))
    end
    expect(wrapped).to match(/"reporting_staff_activities" AS NOT MATERIALIZED \(SELECT .* WHERE \(false\)\)/)
    expect(wrapped).to end_with(sql)
  end
end
