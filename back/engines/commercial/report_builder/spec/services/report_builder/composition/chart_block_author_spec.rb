# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::ChartBlockAuthor do
  subject(:chart_author) { described_class.new(author, locale: 'en') }

  # Layer 2's restricted role is cluster-global; provision it idempotently so the
  # authored query can be validated the way the composer validates it.
  # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
  before(:all) do
    McpServer::AnalyticsReaderProvisioner.ensure_role!
    Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
  end
  # rubocop:enable RSpec/BeforeAfterAll

  let(:author) { create(:admin) }
  let(:sql) { 'SELECT count(*) AS count FROM reporting_contributions' }
  let(:source) do
    <<~TSX
      import { Box, Text, useReportingData } from 'gv-sdk';

      const SQL = `SELECT count(*) AS count FROM reporting_contributions`;

      export default function Block({ msg }) {
        const { data } = useReportingData(SQL);
        return <Box><Text>{msg('total')}: {data ? data.rows.length : 0}</Text></Box>;
      }
    TSX
  end
  let(:messages) { { 'en' => { 'total' => 'Contributions' } } }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('CUSTOM_BLOCK_SANDBOX_SECRET', nil).and_return('test-secret')

    stub_request(:post, 'http://custom_block_sandbox:3100/build').to_return(
      status: 200,
      body: {
        ok: true,
        bundle: 'export default function Block(){return null}',
        manifest: { 'queries' => [sql] },
        toolchain: { 'esbuild' => '0.28.2', 'typescript' => '5.7.3', 'sdk' => 'v1' }
      }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
  end

  def author_with(config_schema = nil)
    chart_author.author(
      title: 'Chart', source: source, config_schema: config_schema, messages: messages
    )
  end

  def stored_version(result)
    ContentBuilder::CustomBlock.find(result.block_id).versions.find_by!(number: result.version_number)
  end

  describe 'storing a chart' do
    it 'writes one published block with one complete version' do
      result = author_with
      version = stored_version(result)

      expect(ContentBuilder::CustomBlock.find(result.block_id)).to be_published
      expect(version.source).to eq source
      expect(version.bundle).to eq 'export default function Block(){return null}'
      expect(version.messages).to eq messages
      expect(version.sdk_version).to eq 'v1'
      expect(version.toolchain).to include('esbuild' => '0.28.2')
    end

    it 'records the query the build read out of the source' do
      expect(stored_version(author_with).queries)
        .to eq [McpServer::SqlSandboxer.validate(sql).normalized_sql]
    end

    it 'names the block in the report locale' do
      result = author_with

      expect(ContentBuilder::CustomBlock.find(result.block_id).title_multiloc).to eq('en' => 'Chart')
    end

    it 'refuses a source that is empty' do
      expect { chart_author.author(title: 'Chart', source: ' ', messages: messages) }
        .to raise_error described_class::Rejected, /source is required/
    end
  end

  describe 'when the build fails' do
    before do
      stub_request(:post, 'http://custom_block_sandbox:3100/build').to_return(
        status: 200,
        body: {
          ok: false, bundle: nil, manifest: { 'queries' => [] },
          diagnostics: [{ 'kind' => 'type', 'line' => 6, 'message' => 'Property does not exist.' }]
        }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )
    end

    it 'hands the diagnostics back to be fixed' do
      expect { author_with }.to raise_error described_class::Rejected, /Property does not exist/
    end

    it 'stores nothing, so nothing can be placed that would fail at read time' do
      expect { suppress(described_class::Rejected) { author_with } }
        .not_to change(ContentBuilder::CustomBlock, :count)
    end
  end

  describe 'when the sandbox is down' do
    before { stub_request(:post, 'http://custom_block_sandbox:3100/build').to_timeout }

    # Sending the model back to rewrite working code would waste a whole turn on
    # something it cannot influence.
    it 'says so rather than blaming the source' do
      expect { author_with }
        .to raise_error described_class::Rejected, /cannot be checked right now/
    end
  end

  describe 'config_schema' do
    def stored_schema(result)
      stored_version(result).manifest['config_schema']
    end

    it 'stores the properties so the builder can render them as settings' do
      schema = {
        'type' => 'object',
        'properties' => {
          'title' => { 'type' => 'string', 'x-multiloc' => true, 'title' => 'Chart title' },
          'showValues' => { 'type' => 'boolean', 'title' => 'Show values', 'default' => true }
        }
      }

      expect(stored_schema(author_with(schema))).to eq schema
    end

    it 'accepts a chart that exposes nothing' do
      expect(stored_schema(author_with)).to eq('type' => 'object', 'properties' => {})
    end

    it 'keeps only the schema keys the sidebar reads' do
      result = author_with(
        'type' => 'object', 'nonsense' => 1,
        'properties' => { 'topN' => { 'type' => 'integer', 'title' => 'Rows' } }
      )

      expect(stored_schema(result)).not_to have_key('nonsense')
    end

    it 'rejects a type no input can render, rather than promising a setting that never appears' do
      expect { author_with('type' => 'object', 'properties' => { 'hue' => { 'type' => 'colour', 'title' => 'Colour' } }) }
        .to raise_error(described_class::Rejected, /use one of/)
    end

    it 'rejects a key that is not usable as config[key]' do
      expect { author_with('type' => 'object', 'properties' => { 'top n' => { 'type' => 'integer', 'title' => 'Rows' } }) }
        .to raise_error(described_class::Rejected, /JavaScript identifier/)
    end

    it 'rejects a field with no label to show beside its input' do
      expect { author_with('type' => 'object', 'properties' => { 'topN' => { 'type' => 'integer' } }) }
        .to raise_error(described_class::Rejected, /needs a title/)
    end

    it 'rejects an empty enum, which would render a dropdown with nothing in it' do
      expect do
        author_with('type' => 'object',
          'properties' => { 'sort' => { 'type' => 'string', 'title' => 'Sort', 'enum' => [] } })
      end.to raise_error(described_class::Rejected, /non-empty array/)
    end

    it 'rejects a picker the sidebar has no control for' do
      expect do
        author_with('type' => 'object',
          'properties' => { 'phaseId' => { 'type' => 'string', 'title' => 'Phase', 'x-picker' => 'phase' } })
      end.to raise_error(described_class::Rejected, /x-picker/)
    end

    it 'rejects x-multiloc on something that is not a string' do
      expect do
        author_with('type' => 'object',
          'properties' => { 'topN' => { 'type' => 'integer', 'title' => 'Rows', 'x-multiloc' => true } })
      end.to raise_error(described_class::Rejected, /only a string can be translated/)
    end

    it 'rejects required fields it does not define' do
      expect do
        author_with('type' => 'object', 'required' => ['missing'],
          'properties' => { 'topN' => { 'type' => 'integer', 'title' => 'Rows' } })
      end.to raise_error(described_class::Rejected, /requires fields it does not define/)
    end

    it 'rejects more fields than a sidebar is worth' do
      properties = (1..7).to_h { |n| ["field#{n}", { 'type' => 'integer', 'title' => "Field #{n}" }] }

      expect { author_with('type' => 'object', 'properties' => properties) }
        .to raise_error(described_class::Rejected, /most a chart may expose/)
    end
  end

  describe 'messages' do
    it 'refuses a shape the renderer could not read' do
      expect { chart_author.author(title: 'Chart', source: source, messages: { 'en' => 'Contributions' }) }
        .to raise_error described_class::Rejected, /locale to key-value pairs/
    end
  end

  describe '#edit' do
    let(:authored) { author_with }

    it 'writes the change as a new version and leaves the old one alone' do
      previous = stored_version(authored)

      result = chart_author.edit(
        block_id: authored.block_id, find: "msg('total')", replace: "msg('heading')"
      )

      expect(result.version_number).to eq previous.number + 1
      expect(previous.reload.source).to include "msg('total')"
      expect(stored_version(result).source).to include "msg('heading')"
    end

    # A report already placing the old version keeps rendering exactly what it did.
    it 'leaves the previous version byte for byte as it was' do
      previous = stored_version(authored)
      before = { source: previous.source, bundle: previous.bundle, messages: previous.messages }

      chart_author.edit(block_id: authored.block_id, find: "msg('total')", replace: "msg('heading')")

      expect(previous.reload).to have_attributes(before)
    end

    it 'carries the catalogues over, so the edit does not silently drop them' do
      result = chart_author.edit(
        block_id: authored.block_id, find: "msg('total')", replace: "msg('heading')"
      )

      expect(stored_version(result).messages).to eq messages
    end

    # Silence here would be worse than an error: the model would go on to place a
    # version it believes it fixed.
    it 'refuses a passage that is not there, and changes nothing' do
      expect { chart_author.edit(block_id: authored.block_id, find: 'not in the file', replace: 'x') }
        .to raise_error(described_class::Rejected, /not in the source/)

      expect(ContentBuilder::CustomBlock.find(authored.block_id).versions.count).to eq 1
    end

    it 'refuses a passage that appears more than once, saying how many' do
      expect { chart_author.edit(block_id: authored.block_id, find: 'const', replace: 'let') }
        .to raise_error(described_class::Rejected, /appears 2 times/)
    end

    it 'refuses an edit that stops the block building' do
      authored
      stub_request(:post, 'http://custom_block_sandbox:3100/build').to_return(
        status: 200,
        body: { ok: false, bundle: nil, manifest: {},
                diagnostics: [{ 'kind' => 'type', 'line' => 3, 'message' => 'Cannot find name.' }],
                toolchain: {} }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )

      expect { chart_author.edit(block_id: authored.block_id, find: "msg('total')", replace: 'nope(') }
        .to raise_error(described_class::Rejected, /does not build/)
      expect(ContentBuilder::CustomBlock.find(authored.block_id).versions.count).to eq 1
    end

    # Generated source is full of backslashes; a replacement read as a backreference
    # would quietly corrupt the file.
    it 'puts the replacement in literally, backslashes and all' do
      result = chart_author.edit(
        block_id: authored.block_id, find: "msg('total')", replace: 'String.raw`\\d+`'
      )

      expect(stored_version(result).source).to include 'String.raw`\\d+`'
    end

    it 'refuses a block it does not know' do
      expect { chart_author.edit(block_id: SecureRandom.uuid, find: 'a', replace: 'b') }
        .to raise_error(described_class::Rejected, /No block/)
    end

    it 'refuses an empty search' do
      expect { chart_author.edit(block_id: authored.block_id, find: '', replace: 'b') }
        .to raise_error(described_class::Rejected, /find is required/)
    end
  end
end
