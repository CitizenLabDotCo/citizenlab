# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::Tools::GetReportingSqlSchema do
  describe '#input_schema' do
    it 'restricts table_names to the whitelisted reporting tables' do
      enum = described_class.new.input_schema.dig(:properties, :table_names, :items, :enum)
      expect(enum).to eq(described_class::REPORTING_TABLES)
    end
  end

  describe McpServer::Tools::GetReportingSqlSchema::Runner do
    def run(params = {})
      described_class.new(
        params: params,
        server_context: {},
        current_user: nil,
        token_scopes: []
      ).run
    end

    it 'returns the schema for every reporting table when no table_names are given' do
      response = run

      expect(response.error?).to be false
      expect(response.structured_content.keys)
        .to match_array(McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES)
    end

    it 'returns column metadata for the participations fact view' do
      columns = run.structured_content.fetch('analytics_fact_participations')

      expect(columns.map { |c| c[:name] })
        .to include('participant_id', 'dimension_project_id', 'dimension_date_created_id')
      expect(columns.first.keys).to match_array(%i[name type null default comment])
    end

    it 'filters to the requested tables' do
      response = run(table_names: ['analytics_fact_participations'])

      expect(response.structured_content.keys).to eq(['analytics_fact_participations'])
    end

    it 'ignores table names outside the whitelist' do
      response = run(table_names: %w[users does_not_exist])

      expect(response.error?).to be false
      expect(response.structured_content).to eq({})
    end

    it 'duplicates the structured content into a text block' do
      expect(run.content.first[:text]).to include('analytics_fact_participations')
    end
  end
end
