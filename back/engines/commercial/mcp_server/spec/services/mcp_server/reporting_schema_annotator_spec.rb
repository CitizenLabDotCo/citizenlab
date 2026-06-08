# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::ReportingSchemaAnnotator do
  # COMMENT ON is transactional, so anything these examples set is rolled back
  # with the test transaction.
  def connection = ActiveRecord::Base.connection

  def relation_comment(relation)
    connection.select_value("SELECT obj_description(#{connection.quote(relation)}::regclass, 'pg_class')")
  end

  def column_comment(relation, column)
    connection.select_value(<<~SQL.squish)
      SELECT col_description(#{connection.quote(relation)}::regclass, a.attnum)
      FROM pg_attribute a
      WHERE a.attrelid = #{connection.quote(relation)}::regclass AND a.attname = #{connection.quote(column)}
    SQL
  end

  describe '.annotate!' do
    before { described_class.annotate! }

    it 'documents a fact VIEW and its columns' do
      expect(relation_comment('analytics_fact_participations')).to match(/one row per participation action/)
      expect(column_comment('analytics_fact_participations', 'participant_id')).to match(/distinct counts/)
    end

    it 'documents a dimension TABLE and its columns' do
      expect(relation_comment('analytics_dimension_types')).to match(/Type dimension/)
      expect(column_comment('analytics_dimension_types', 'parent')).to match(/NULL for poll/)
    end

    it 'covers every reporting table exposed by the schema tool' do
      documented = described_class::ANNOTATIONS.keys
      expect(documented).to match_array(McpServer::Tools::GetReportingSqlSchema::REPORTING_TABLES)
    end
  end

  describe '.clear!' do
    it 'removes the comments it set' do
      described_class.annotate!
      described_class.clear!

      expect(relation_comment('analytics_fact_participations')).to be_nil
      expect(column_comment('analytics_fact_participations', 'id')).to be_nil
    end
  end
end
