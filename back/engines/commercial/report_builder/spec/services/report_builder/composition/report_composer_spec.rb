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

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('CHECK_SERVICE_SECRET', nil).and_return('test-secret')
    stub_check_service
  end

  let(:project) { create(:project) }
  let(:sql) { 'SELECT count(*) AS count FROM reporting_contributions' }
  let(:authored) do
    {
      'title' => 'Contributions',
      'source' => block_source,
      'messages' => { 'en' => { 'total' => 'Contributions' } },
      'config_schema' => { 'type' => 'object', 'properties' => {} }
    }
  end
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

  # A first write is just a patch that carries every node.
  def write_layout(layout, id: 'tu_layout')
    tool_call('patch_layout', { 'nodes' => layout }, id: id)
  end

  # The model stopping is what ends a run, so most stubs finish with this.
  def done(text = 'Wrote the report.')
    respond_with([content_block_class.new(text, nil)], 'end_turn')
  end

  # Blocks are compiled and checked by the check service before anything is stored,
  # so every authoring path goes through it. The default is a clean build; the specs
  # that care about failure re-stub it.
  def stub_check_service(ok: true, diagnostics: [])
    stub_request(:post, 'http://check_service:3100/build').to_return(
      status: 200,
      body: {
        ok: ok,
        bundle: ok ? 'export default function Block(){return null}' : nil,
        manifest: { 'queries' => [sql] },
        diagnostics: diagnostics,
        toolchain: { 'esbuild' => '0.28.2', 'typescript' => '5.7.3', 'sdk' => 'v1' }
      }.to_json,
      headers: { 'Content-Type' => 'application/json' }
    )
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

  # Every tool result the model was sent, oldest first. A run now ends when the model
  # stops rather than when a tool returns a layout, so the result a spec cares about
  # is usually not the last one.
  def tool_results
    sent_messages.flatten.flat_map { |m| m[:content] || [] }.filter_map { |c| c[:tool_result] }
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
    it 'returns the report the patches built' do
      stub_converse(write_layout(text_layout), done)

      expect(composer.compose).to eq text_layout
    end

    it 'gives the model the reporting schema, the widget reference and the project' do
      stub_converse(write_layout(text_layout), done)

      composer.compose

      expect(client).to have_received(:converse).at_least(:once) do |args|
        system_prompt = args[:system].first[:text]
        expect(system_prompt).to include 'reporting_contributions'
        expect(system_prompt).to include project.title_multiloc['en']
        expect(system_prompt).to include ReportBuilder::Craftjs::LayoutWidgets::DOCS['CustomBlock']
        expect(args[:tool_config][:tools].map { |tool| tool[:tool_spec][:name] })
          .to eq %w[run_reporting_sql_query author_chart_block get_layout patch_layout]
      end
    end

    it 'tells the model the report is printed, which is what the charts are sized for' do
      stub_converse(write_layout(text_layout), done)

      composer.compose

      expect(client).to have_received(:converse).at_least(:once) do |args|
        system_prompt = args[:system].first[:text]
        expect(system_prompt).to include 'A4'
        expect(system_prompt).to include 'never split across a page break'
        expect(system_prompt).to include 'only be read from a tooltip'
      end
    end

    describe 'run_reporting_sql_query' do
      it 'runs the query and hands back the columns and rows' do
        stub_converse(
          tool_call('run_reporting_sql_query',
            { 'query' => 'SELECT count(*) AS contributions FROM reporting_contributions' }),
          write_layout(text_layout),
          done
        )

        composer.compose

        expect(tool_results.first[:status]).to eq 'success'
        expect(tool_results.first[:content].first[:text]).to include 'contributions'
      end

      it 'hands back the sandbox rejection rather than running it' do
        stub_converse(
          tool_call('run_reporting_sql_query', { 'query' => 'SELECT * FROM users' }),
          write_layout(text_layout),
          done
        )

        composer.compose

        expect(tool_results.first[:status]).to eq 'error'
        expect(tool_results.first[:content].first[:text]).to include 'rejected'
      end
    end

    describe 'author_chart_block' do
      it 'stores the block and answers with the id to place' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          if sent_messages.size == 1
            tool_call('author_chart_block', authored)
          else
            write_layout(layout_with(
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
        expect(version.bundle).to eq 'export default function Block(){return null}'
        expect(version.manifest['queries']).to eq [sql]
      end

      it 'discards a chart the finished layout does not use' do
        stub_converse(tool_call('author_chart_block', authored), write_layout(text_layout), done)

        expect { composer.compose }.not_to change(ContentBuilder::CustomBlock, :count)
      end

      # The build is what decides; the composer's job is to pass its verdict back in a
      # form the model can act on rather than swallowing it.
      it 'hands a failed build back as a correctable tool error' do
        stub_check_service(
          ok: false,
          diagnostics: [
            { 'kind' => 'lint', 'line' => 2, 'rule' => 'no-network', 'message' => 'No fetch in a block.' }
          ]
        )
        stub_converse(tool_call('author_chart_block', authored), write_layout(text_layout), done)

        expect { composer.compose }.not_to change(ContentBuilder::CustomBlock, :count)
        expect(tool_results.first[:status]).to eq 'error'
        expect(tool_results.first[:content].first[:text]).to include 'no-network'
        expect(tool_results.first[:content].first[:text]).to include 'line 2'
      end

      it 'says so plainly when the block cannot be checked at all' do
        stub_request(:post, 'http://check_service:3100/build').to_timeout
        stub_converse(tool_call('author_chart_block', authored), write_layout(text_layout), done)

        composer.compose

        expect(tool_results.first[:content].first[:text]).to include 'cannot be checked right now'
      end
    end

    describe 'a reply cut off by the output token limit' do
      def truncated(name, input, id: 'tu_cut')
        respond_with([content_block_class.new(nil, tool_use_class.new(id, name, input))], 'max_tokens')
      end

      # The fragment parses, so it reaches the tool looking like a real argument. A
      # half-written layout is a layout with most of the report missing.
      it 'does not apply a layout out of a truncated reply' do
        half = layout_with('textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<p>Half</p>' } }))
        stub_converse(
          truncated('set_layout', { 'layout' => half }),
          write_layout(text_layout, id: 'tu_2')
        )

        expect(composer.compose).to eq text_layout
      end

      it 'tells the model the call was not run, and why' do
        stub_converse(
          truncated('set_layout', { 'layout' => text_layout }),
          write_layout(text_layout, id: 'tu_2')
        )

        composer.compose

        cut_off = sent_messages.flatten.flat_map { |m| m[:content] || [] }
          .filter_map { |c| c[:tool_result] }
          .find { |r| r[:content].first[:text].to_s.include?('cut off') }
        expect(cut_off).to be_present
        expect(cut_off[:status]).to eq 'error'
      end

      # Bedrock rejects the next request if a tool call went unanswered, so the
      # truncation has to come back as a tool result, not a plain message.
      it 'answers every tool call the truncated reply had started' do
        stub_converse(
          respond_with(
            [
              content_block_class.new(nil, tool_use_class.new('tu_a', 'set_layout', { 'layout' => text_layout })),
              content_block_class.new(nil, tool_use_class.new('tu_b', 'set_layout', { 'layout' => text_layout }))
            ],
            'max_tokens'
          ),
          write_layout(text_layout, id: 'tu_2')
        )

        composer.compose

        answered = sent_messages.flatten.flat_map { |m| m[:content] || [] }
          .filter_map { |c| c.dig(:tool_result, :tool_use_id) }
        expect(answered).to include('tu_a', 'tu_b')
      end

      it 'nudges when the truncated reply had not started a tool call yet' do
        stub_converse(
          respond_with([content_block_class.new('Thinking about it', nil)], 'max_tokens'),
          write_layout(text_layout, id: 'tu_2')
        )

        expect(composer.compose).to eq text_layout
      end
    end

    describe 'when no valid layout is produced' do
      it 'fails loudly rather than saving an empty report' do
        stub_converse(respond_with([content_block_class.new('no tools for me', nil)], 'end_turn'))

        expect { composer.compose }.to raise_error described_class::ComposeError
      end

      # Paid rounds and a pile of built charts, and the report never gets written: the
      # blocks would be unreachable from any layout and undeletable from the UI.
      it 'discards charts it authored before giving up' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          if sent_messages.size == 1
            tool_call('author_chart_block', authored)
          else
            respond_with([content_block_class.new('I give up', nil)], 'end_turn')
          end
        end

        expect { suppress(described_class::ComposeError) { composer.compose } }
          .not_to change(ContentBuilder::CustomBlock, :count)
      end
    end

    describe 'building a report over several patches' do
      let(:first_patch) do
        { 'ROOT' => text_layout['ROOT'].merge('nodes' => ['textnode01']),
          'textnode01' => node('TextMultiloc', { 'text' => { 'en' => '<p>Opening</p>' } }) }
      end
      let(:second_patch) do
        { 'ROOT' => text_layout['ROOT'].merge('nodes' => %w[textnode01 textnode02]),
          'textnode02' => node('TextMultiloc', { 'text' => { 'en' => '<p>Closing</p>' } }) }
      end

      it 'keeps what earlier patches wrote' do
        stub_converse(
          tool_call('patch_layout', { 'nodes' => first_patch }),
          tool_call('patch_layout', { 'nodes' => second_patch }, id: 'tu_2'),
          done
        )

        expect(composer.compose.keys).to contain_exactly('ROOT', 'textnode01', 'textnode02')
      end

      it 'answers a patch with the report as it now reads' do
        stub_converse(tool_call('patch_layout', { 'nodes' => first_patch }), done)

        composer.compose

        expect(tool_results.first[:content].first[:text]).to include 'textnode01'
      end

      it 'leaves the report alone when a patch does not validate' do
        stub_converse(
          tool_call('patch_layout', { 'nodes' => first_patch }),
          tool_call('patch_layout', { 'nodes' => { 'textnode02' => 'not a node' } }, id: 'tu_2'),
          done
        )

        expect(composer.compose.keys).to contain_exactly('ROOT', 'textnode01')
      end

      it 'removes a node the model asks to delete' do
        stub_converse(
          tool_call('patch_layout', { 'nodes' => first_patch.merge(second_patch) }),
          tool_call('patch_layout', {
            'nodes' => { 'ROOT' => text_layout['ROOT'].merge('nodes' => ['textnode01']) },
            'delete_node_ids' => ['textnode02']
          }, id: 'tu_2'),
          done
        )

        expect(composer.compose.keys).to contain_exactly('ROOT', 'textnode01')
      end

      # The failure this replaced: a run that used every round wrote nothing at all,
      # throwing away the charts it had paid to build along with the report.
      it 'keeps an unfinished report when it runs out of rounds' do
        stub_converse(tool_call('patch_layout', { 'nodes' => first_patch }))

        expect(composer.compose.keys).to contain_exactly('ROOT', 'textnode01')
      end
    end

    describe 'get_layout' do
      it 'says the report is empty before anything is written' do
        stub_converse(tool_call('get_layout', {}), write_layout(text_layout), done)

        composer.compose

        expect(tool_results.first[:content].first[:text]).to include 'empty'
      end

      it 'shows the nodes once there are some' do
        stub_converse(
          write_layout(text_layout),
          tool_call('get_layout', {}, id: 'tu_2'),
          done
        )

        composer.compose

        expect(tool_results.last[:content].first[:text]).to include text_layout.keys.last
      end
    end

    describe 'patch_layout' do
      it 'refuses a chart node pointing at a block that was never authored' do
        chart_layout = layout_with(
          'chartnode1' => node('CustomBlock', { 'blockId' => SecureRandom.uuid, 'version' => 1 })
        )
        stub_converse(write_layout(chart_layout), write_layout(text_layout, id: 'tu_2'), done)

        expect(composer.compose).to eq text_layout
        expect(tool_results.first[:status]).to eq 'error'
      end

      it 'accepts a chart node pointing at a block authored in this run' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          case sent_messages.size
          when 1 then tool_call('author_chart_block', authored)
          when 2
            block_id = ContentBuilder::CustomBlock.last.id
            write_layout(
              layout_with('chartnode1' => node('CustomBlock', { 'blockId' => block_id, 'version' => 1 }))
            )
          else done
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
        write_layout(text_layout),
        done
      )

      expect(composer.compose).to eq text_layout
      nudges = sent_messages.flatten.flat_map { |m| m[:content] || [] }.filter_map { |c| c[:text] }
      expect(nudges).to include a_string_including('Do not reply with text')
    end

    it 'gives up rather than looping forever on a layout that never validates' do
      stub_converse(write_layout({ 'ROOT' => 'not a node' }), done)

      expect { composer.compose }.to raise_error(described_class::ComposeError)
      expect(client).to have_received(:converse).exactly(described_class::MAX_ROUNDS).times
    end
  end
end
