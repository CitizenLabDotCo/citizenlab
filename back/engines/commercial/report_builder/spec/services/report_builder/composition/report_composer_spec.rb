# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::ReportComposer do
  # Layer 2's restricted role is cluster-global; provision it idempotently so the
  # composer's queries can be exercised end-to-end, the way the MCP tool's spec does.
  # rubocop:disable RSpec/BeforeAfterAll -- role is cluster-global; set up once.
  before(:all) do
    McpServer::AnalyticsReaderProvisioner.ensure_role!
    Apartment.tenant_names.each { |schema| McpServer::AnalyticsReaderProvisioner.grant!(schema) }
  end
  # rubocop:enable RSpec/BeforeAfterAll

  let(:project) { create(:project) }
  let(:block_source) do
    <<~TSX
      import { React, Box, Text, useReportingData } from 'gv-sdk';

      const SQL = `SELECT count(*) AS count FROM reporting_contributions`;

      export default function Block() {
        const { data } = useReportingData(SQL);
        return <Box><Text>{data ? data.rows.length : 0}</Text></Box>;
      }
    TSX
  end
  let!(:phase) { create(:phase, project: project) }
  let(:client) { instance_double(Aws::BedrockRuntime::Client) }
  let(:composer) { described_class.new(project, locale: 'en', client: client) }
  let(:sent_messages) { [] }

  # Minimal stand-ins for the AWS SDK response structs.
  let(:content_block_class) { Struct.new(:text, :tool_use) }
  let(:tool_use_class) { Struct.new(:tool_use_id, :name, :input) }
  let(:response_class) { Struct.new(:output, :stop_reason) }
  let(:output_class) { Struct.new(:message) }
  let(:message_class) { Struct.new(:role, :content) }

  def respond_with(content_blocks, stop_reason)
    response_class.new(output_class.new(message_class.new('assistant', content_blocks)), stop_reason)
  end

  def tool_call(name, input, id: 'tu_1')
    respond_with([content_block_class.new(nil, tool_use_class.new(id, name, input))], 'tool_use')
  end

  def set_layout(layout, id: 'tu_layout')
    tool_call('set_layout', { 'layout' => layout }, id: id)
  end

  # The composer appends to one messages array, so a plain spy records every call
  # as the array's final state. Snapshot what each call was actually sent.
  def stub_converse(*responses)
    allow(client).to receive(:converse) do |args|
      sent_messages << args[:messages].deep_dup
      responses.length > 1 ? responses.shift : responses.first
    end
  end

  def last_tool_result
    sent_messages.last.last[:content].first[:tool_result]
  end

  def node(resolved_name, props, parent: 'ROOT')
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => [],
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => false,
      'displayName' => resolved_name,
      'linkedNodes' => {}
    }
  end

  def layout_with(nodes)
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => nodes.keys,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      }
    }.merge(nodes)
  end

  def text_layout
    layout_with('textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<h2>The project</h2>' } }))
  end

  describe '#compose' do
    it 'returns the layout of the first reply that validates' do
      allow(client).to receive(:converse).and_return(set_layout(text_layout))

      expect(composer.compose).to eq text_layout
      expect(client).to have_received(:converse).once
    end

    it 'gives the model the reporting schema, the widget reference and the project' do
      allow(client).to receive(:converse).and_return(set_layout(text_layout))

      composer.compose

      expect(client).to have_received(:converse) do |args|
        system_prompt = args[:system].first[:text]
        expect(system_prompt).to include 'reporting_contributions'
        expect(system_prompt).to include project.title_multiloc['en']
        expect(system_prompt).to include ReportBuilder::Craftjs::LayoutWidgets::DOCS['CustomBlock']
        expect(args[:tool_config][:tools].map { |tool| tool[:tool_spec][:name] })
          .to eq %w[run_reporting_sql_query author_chart_block set_layout]
      end
    end

    describe 'run_reporting_sql_query' do
      it 'runs the query and hands back the columns and rows' do
        stub_converse(
          tool_call('run_reporting_sql_query',
            { 'query' => 'SELECT count(*) AS contributions FROM reporting_contributions' }),
          set_layout(text_layout)
        )

        composer.compose

        expect(last_tool_result[:status]).to eq 'success'
        expect(last_tool_result[:content].first[:text]).to include 'contributions'
      end

      it 'hands back the sandbox rejection rather than running it' do
        stub_converse(
          tool_call('run_reporting_sql_query', { 'query' => 'SELECT * FROM users' }),
          set_layout(text_layout)
        )

        composer.compose

        expect(last_tool_result[:status]).to eq 'error'
        expect(last_tool_result[:content].first[:text]).to include 'rejected'
      end
    end

    describe 'author_chart_block' do
      let(:authored) do
        {
          'title' => 'Contributions',
          'sql' => 'SELECT count(*) AS count FROM reporting_contributions',
          'source' => block_source
        }
      end

      it 'stores the block and answers with the id to place' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          if sent_messages.size == 1
            tool_call('author_chart_block', authored)
          else
            set_layout(layout_with(
              'chartnode1' => node('CustomBlock', {
                'blockId' => ContentBuilder::CustomBlock.last.id, 'version' => 1
              })
            ))
          end
        end

        expect { composer.compose }
          .to change(ContentBuilder::CustomBlock, :count).by(1)
          .and change(ContentBuilder::CustomBlockVersion, :count).by(1)

        version = ContentBuilder::CustomBlockVersion.last
        expect(version).to be_pending
        expect(version.manifest['queries']).to eq [authored['sql']]
      end

      it 'discards a chart the finished layout does not use' do
        stub_converse(tool_call('author_chart_block', authored), set_layout(text_layout))

        expect { composer.compose }.not_to change(ContentBuilder::CustomBlock, :count)
      end

      it 'refuses a source that does not carry the query it declared' do
        stub_converse(
          tool_call('author_chart_block', authored.merge('source' => 'export default function Block() {}')),
          set_layout(text_layout)
        )

        expect { composer.compose }.not_to change(ContentBuilder::CustomBlock, :count)
        expect(last_tool_result[:status]).to eq 'error'
        expect(last_tool_result[:content].first[:text]).to include 'character for character'
      end

      it 'refuses a source that reaches outside the sdk' do
        forbidden = block_source.sub('export default', "const r = await fetch('/x');\nexport default")
        stub_converse(
          tool_call('author_chart_block', authored.merge('source' => forbidden)),
          set_layout(text_layout)
        )

        composer.compose

        expect(last_tool_result[:content].first[:text]).to include 'no-network'
      end
    end

    describe 'set_layout' do
      it 'refuses a chart node pointing at a block that was never authored' do
        chart_layout = layout_with(
          'chartnode1' => node('CustomBlock', { 'blockId' => SecureRandom.uuid, 'version' => 1 })
        )
        stub_converse(set_layout(chart_layout), set_layout(text_layout, id: 'tu_2'))

        expect(composer.compose).to eq text_layout
        expect(last_tool_result[:status]).to eq 'error'
      end

      it 'accepts a chart node pointing at a block authored in this run' do
        authored = {
          'title' => 'Contributions',
          'sql' => 'SELECT count(*) AS count FROM reporting_contributions',
          'source' => block_source
        }
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          if sent_messages.size == 1
            tool_call('author_chart_block', authored)
          else
            block_id = ContentBuilder::CustomBlock.last.id
            set_layout(
              layout_with('chartnode1' => node('CustomBlock', { 'blockId' => block_id, 'version' => 1 }))
            )
          end
        end

        result = composer.compose

        expect(result['chartnode1']['props']['blockId'])
          .to eq ContentBuilder::CustomBlock.last.id
      end
    end

    it 'tells the model to use the tools when it replies with text only' do
      stub_converse(
        respond_with([content_block_class.new('What would you like?', nil)], 'end_turn'),
        set_layout(text_layout)
      )

      expect(composer.compose).to eq text_layout
      expect(sent_messages.last.last[:content].first[:text]).to include 'Do not reply with text'
    end

    it 'gives up rather than looping forever on a layout that never validates' do
      allow(client).to receive(:converse).and_return(set_layout({ 'ROOT' => 'not a node' }))

      expect { composer.compose }.to raise_error(described_class::ComposeError)
      expect(client).to have_received(:converse).exactly(described_class::MAX_ROUNDS).times
    end
  end
end
