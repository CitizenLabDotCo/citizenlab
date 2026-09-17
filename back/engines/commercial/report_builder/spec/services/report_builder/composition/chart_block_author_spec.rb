# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::ChartBlockAuthor do
  subject(:chart_author) { described_class.new(project, author) }

  # Layer 2's restricted role is cluster-global; provision it idempotently so the
  # authored query can be validated the way the composer validates it.
  # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
  before(:all) do
    McpServer::AnalyticsReaderProvisioner.ensure_role!
    Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
  end
  # rubocop:enable RSpec/BeforeAfterAll

  let(:project) { create(:project) }
  let(:author) { create(:admin) }
  let(:sql) { 'SELECT count(*) AS count FROM reporting_contributions' }
  let(:source) do
    <<~TSX
      import { React, Box, Text, useReportingData } from 'gv-sdk';

      const SQL = `SELECT count(*) AS count FROM reporting_contributions`;

      export default function Block({ config }) {
        const { data } = useReportingData(SQL);
        return <Box><Text>{data ? data.rows.length : 0}</Text></Box>;
      }
    TSX
  end

  def author_with(config_schema)
    chart_author.author(title: 'Chart', sql: sql, source: source, config_schema: config_schema)
  end

  def stored_schema(result)
    ContentBuilder::CustomBlock.find(result.block_id).current_version.manifest['config_schema']
  end

  describe 'config_schema' do
    it 'stores the fields so the builder can render them as settings' do
      result = author_with(
        [{ 'key' => 'title', 'type' => 'multiloc_text', 'label' => { 'en' => 'Chart title' },
           'default' => { 'en' => 'Participants' } }]
      )

      expect(stored_schema(result)).to eq(
        [{ 'key' => 'title', 'type' => 'multiloc_text', 'label' => { 'en' => 'Chart title' },
           'default' => { 'en' => 'Participants' } }]
      )
    end

    it 'accepts a chart that exposes nothing' do
      expect(stored_schema(author_with(nil))).to eq([])
    end

    it 'drops keys the builder would not know what to do with' do
      result = author_with(
        [{ 'key' => 'topN', 'type' => 'number', 'label' => { 'en' => 'Rows' }, 'nonsense' => 1 }]
      )

      expect(stored_schema(result).first).not_to have_key('nonsense')
    end

    it 'rejects a type no input can render, rather than promising a setting that never appears' do
      expect { author_with([{ 'key' => 'hue', 'type' => 'colour', 'label' => { 'en' => 'Colour' } }]) }
        .to raise_error(described_class::Rejected, /use one of/)
    end

    it 'rejects a key that is not usable as config[key]' do
      expect { author_with([{ 'key' => 'top n', 'type' => 'number', 'label' => { 'en' => 'Rows' } }]) }
        .to raise_error(described_class::Rejected, /JavaScript identifier/)
    end

    it 'rejects a field with no label to show beside its input' do
      expect { author_with([{ 'key' => 'topN', 'type' => 'number', 'label' => {} }]) }
        .to raise_error(described_class::Rejected, /label per locale/)
    end

    it 'rejects a select with no options' do
      expect { author_with([{ 'key' => 'sort', 'type' => 'select', 'label' => { 'en' => 'Sort' } }]) }
        .to raise_error(described_class::Rejected, /needs options/)
    end

    it 'rejects duplicate keys, which would collide in config' do
      field = { 'key' => 'topN', 'type' => 'number', 'label' => { 'en' => 'Rows' } }

      expect { author_with([field, field]) }
        .to raise_error(described_class::Rejected, /unique/)
    end

    it 'rejects more fields than a sidebar is worth' do
      fields = (1..7).map do |n|
        { 'key' => "field#{n}", 'type' => 'number', 'label' => { 'en' => "Field #{n}" } }
      end

      expect { author_with(fields) }.to raise_error(described_class::Rejected, /most a chart may expose/)
    end
  end
end
