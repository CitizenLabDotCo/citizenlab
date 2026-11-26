# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::CustomBlocks::DataSources do
  describe '.for_queries' do
    it 'names the reporting table a query reads' do
      sql = "SELECT count(*) FROM reporting_contributions WHERE project_id = '1'"

      expect(described_class.for_queries([sql])).to eq %w[reporting_contributions]
    end

    it 'names every table a join reads, in the order the query names them' do
      sql = <<~SQL.squish
        SELECT t.tag_id, count(*) FROM reporting_inputs i
        JOIN reporting_input_tags t ON t.input_id = i.id GROUP BY t.tag_id
      SQL

      expect(described_class.for_queries([sql])).to eq %w[reporting_inputs reporting_input_tags]
    end

    it 'reports a table read by several queries once' do
      queries = [
        'SELECT count(*) FROM reporting_inputs',
        'SELECT count(*) FROM reporting_inputs WHERE published_at IS NOT NULL'
      ]

      expect(described_class.for_queries(queries)).to eq %w[reporting_inputs]
    end

    # A CTE named after a table would otherwise be reported as one.
    it 'leaves out common table expressions' do
      sql = <<~SQL.squish
        WITH base AS (SELECT id FROM reporting_inputs) SELECT count(*) FROM base
      SQL

      expect(described_class.for_queries([sql])).to eq %w[reporting_inputs]
    end

    it 'is empty for a query that reads no table' do
      sql = "SELECT * FROM (VALUES ('a', 1)) t(label, count)"

      expect(described_class.for_queries([sql])).to be_empty
    end

    it 'is empty for a block that runs no query' do
      expect(described_class.for_queries(nil)).to be_empty
      expect(described_class.for_queries([])).to be_empty
    end

    it 'skips a query that no longer parses rather than failing the whole block' do
      expect(described_class.for_queries(['SELECT FROM WHERE', 'SELECT 1 FROM reporting_users']))
        .to eq %w[reporting_users]
    end
  end
end
