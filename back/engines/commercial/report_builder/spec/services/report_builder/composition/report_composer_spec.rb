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
    allow(ENV).to receive(:fetch).with('CUSTOM_BLOCK_SANDBOX_SECRET', nil).and_return('test-secret')
    stub_sandbox
  end

  let(:project) { create(:project) }
  let(:sent_messages) { [] }
  # Minimal stand-ins for the AWS SDK response structs.
  let(:content_block_class) { Struct.new(:text, :tool_use) }
  let(:tool_use_class) { Struct.new(:tool_use_id, :name, :input) }
  let(:response_class) { Struct.new(:output, :stop_reason, :usage) }
  let(:output_class) { Struct.new(:message) }
  let(:message_class) { Struct.new(:role, :content) }
  let(:usage_class) { Struct.new(:input_tokens, :output_tokens, :cache_read_input_tokens, :cache_write_input_tokens) }
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
  let(:checking_composer) do
    described_class.new(project, locale: 'en', client: client, layout_record: create(:layout))
  end
  let(:sandbox) { instance_double(ContentBuilder::CustomBlocks::SandboxClient) }

  # Just enough of a PNG for the checker to read its size off the header.
  let(:png_bytes) { "\x89PNG\r\n\x1a\n".b + [13].pack('N') + 'IHDR'.b + [794, 600].pack('N2') }

  def stub_render(**result)
    allow(ContentBuilder::CustomBlocks::SandboxClient).to receive(:new).and_return(sandbox)
    allow(sandbox).to receive_messages(
      sdk_declarations: "declare module 'gv-sdk' {}",
      render: {
        'checks' => [], 'errors' => [], 'console' => [], 'failedRequests' => [], 'screenshot' => nil
      }.merge(result.transform_keys(&:to_s))
    )
  end

  def respond_with(content_blocks, stop_reason, usage: nil)
    response_class.new(
      output_class.new(message_class.new('assistant', content_blocks)),
      stop_reason,
      usage || usage_class.new(100, 20, 0, 0)
    )
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

  # Blocks are compiled and checked by the sandbox before anything is stored,
  # so every authoring path goes through it. The default is a clean build; the specs
  # that care about failure re-stub it.
  def stub_sandbox(ok: true, diagnostics: [])
    stub_request(:get, 'http://custom_block_sandbox:3100/sdk/v1.d.ts').to_return(
      status: 200, body: "declare module 'gv-sdk' { export const Box: unknown; }"
    )
    stub_request(:post, 'http://custom_block_sandbox:3100/build').to_return(
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

    it 'gives the model the reporting schema, the widget reference, the SDK and the platform' do
      stub_converse(write_layout(text_layout), done)

      composer.compose

      expect(client).to have_received(:converse).at_least(:once) do |args|
        system_prompt = args[:system].first[:text]
        expect(system_prompt).to include 'reporting_contributions'
        expect(system_prompt).to include ReportBuilder::Craftjs::LayoutWidgets::DOCS['CustomBlock']
        expect(system_prompt).to include "declare module 'gv-sdk'"
        expect(system_prompt).to include 'Platform locales'
        expect(args[:tool_config][:tools].filter_map { |tool| tool.dig(:tool_spec, :name) })
          .to eq %w[
            run_reporting_sql_query author_chart_block edit_source check get_layout patch_layout read_docs
          ]
      end
    end

    # The system prompt is the same for every report on the platform; what is about
    # this one comes in the first turn, after the cached prefix.
    it 'puts the project in the first user message, not the system prompt' do
      stub_converse(write_layout(text_layout), done)

      composer.compose

      first_turn = sent_messages.first.first
      expect(first_turn[:role]).to eq 'user'
      expect(first_turn[:content].first[:text]).to include project.title_multiloc['en']
      expect(client).to have_received(:converse).at_least(:once) do |args|
        expect(args[:system].first[:text]).not_to include project.title_multiloc['en']
      end
    end

    it 'says so in the prompt when the SDK declarations cannot be read' do
      stub_request(:get, 'http://custom_block_sandbox:3100/sdk/v1.d.ts').to_return(status: 503)
      stub_converse(write_layout(text_layout), done)

      composer.compose

      expect(client).to have_received(:converse).at_least(:once) do |args|
        expect(args[:system].first[:text]).to include 'cannot be read right now'
      end
    end

    it 'marks the unchanging prefix so the provider can cache it' do
      stub_converse(write_layout(text_layout), done)

      composer.compose

      expect(client).to have_received(:converse).at_least(:once) do |args|
        expect(args[:system].last).to eq(cache_point: { type: 'default' })
        expect(args[:tool_config][:tools].last).to eq(cache_point: { type: 'default' })
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
        stub_sandbox(
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
        stub_request(:post, 'http://custom_block_sandbox:3100/build').to_timeout
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

      it 'discards them too when the provider throws mid-run' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          raise Aws::BedrockRuntime::Errors::ValidationException.new(nil, 'nope') if sent_messages.size > 1

          tool_call('author_chart_block', authored)
        end

        expect { suppress(Aws::BedrockRuntime::Errors::ValidationException) { composer.compose } }
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

    describe 'check' do
      it 'renders the report and hands back what the browser saw' do
        stub_render(checks: [{ 'id' => 'has_height', 'ok' => false, 'message' => 'Only 4px tall.' }])
        stub_converse(write_layout(text_layout), tool_call('check', {}, id: 'tu_2'), done)

        checking_composer.compose

        expect(tool_results.last[:status]).to eq 'error'
        expect(tool_results.last[:content].first[:text]).to include 'has_height'
      end

      it 'hands the model the screenshot when a check failed' do
        stub_render(
          checks: [{ 'id' => 'no_overflow', 'ok' => false, 'message' => 'Too wide.' }],
          screenshot: Base64.strict_encode64(png_bytes)
        )
        stub_converse(write_layout(text_layout), tool_call('check', {}, id: 'tu_2'), done)

        checking_composer.compose

        # The result itself stays text (an error result may hold nothing else); the
        # picture follows it. The provider gets bytes; the run keeps text it can store.
        # The review pass that follows is a conversation of its own, so look across
        # every call, not just the last.
        answer = sent_messages.flatten.find { |m| m[:content].any? { |c| c[:image] } }
        expect(answer[:content].map(&:keys).first(2)).to eq [[:tool_result], [:image]]
        expect(answer[:content].first[:tool_result][:status]).to eq 'error'
        expect(answer[:content][1][:image]).to include(format: 'png')
        expect(answer[:content][1][:image][:source][:bytes]).to eq png_bytes
        kept = checking_composer.transcript.flat_map { |m| m[:content] }.find { |c| c[:image] }
        expect(kept[:image][:source][:bytes]).to eq Base64.strict_encode64(png_bytes)
      end

      it 'hands over the screenshot when asked, even though every check passed' do
        stub_render(checks: [], screenshot: Base64.strict_encode64(png_bytes))
        stub_converse(
          write_layout(text_layout), tool_call('check', { 'include_screenshot' => true }, id: 'tu_2'), done
        )

        checking_composer.compose

        expect(tool_results.last[:status]).to eq 'success'
        answer = sent_messages.flatten.find { |m| m[:content].any? { |c| c[:image] } }
        expect(answer[:content].map(&:keys).first(2)).to eq [[:tool_result], [:image]]
      end

      it 'keeps the picture to itself when every check passed and nobody asked' do
        stub_render(checks: [], screenshot: Base64.strict_encode64(png_bytes))
        stub_converse(write_layout(text_layout), tool_call('check', {}, id: 'tu_2'), done)

        checking_composer.compose

        expect(sent_messages.flatten.flat_map { |m| m[:content] }).to all(satisfy { |c| !c.key?(:image) })
      end

      it 'renders one part of the report when given a node' do
        stub_render
        stub_converse(
          write_layout(text_layout), tool_call('check', { 'node_id' => 'textnode01' }, id: 'tu_2'), done
        )

        checking_composer.compose

        expect(sandbox).to have_received(:render).with(
          hash_including(target: hash_including(kind: 'layout', craftjs_json: hash_including('ROOT', 'textnode01')))
        ).at_least(:once)
      end

      it 'says when there is no such node' do
        stub_render
        stub_converse(write_layout(text_layout), tool_call('check', { 'node_id' => 'ghost' }, id: 'tu_2'), done)

        checking_composer.compose

        expect(tool_results.last[:content].first[:text]).to include 'no node ghost'
      end

      it 'refuses to check a block this run never authored' do
        stub_render
        stub_converse(
          write_layout(text_layout),
          tool_call('check', { 'block_id' => SecureRandom.uuid }, id: 'tu_2'),
          done
        )

        checking_composer.compose

        expect(tool_results.last[:content].first[:text]).to include 'was authored in this run'
      end

      it 'says checking is off when there is no layout to check against' do
        stub_converse(write_layout(text_layout), tool_call('check', {}, id: 'tu_2'), done)

        composer.compose

        expect(tool_results.last[:content].first[:text]).to include 'not available'
      end
    end

    describe 'edit_source' do
      # The saving the tool exists for: a one-word fix costs a few hundred output
      # tokens instead of the whole file.
      it 'writes a new version of a chart it authored' do
        # The block id is only known once the chart is stored, so the replies are
        # built per round rather than queued up front.
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          case sent_messages.size
          when 1 then tool_call('author_chart_block', authored)
          when 2
            tool_call('edit_source', {
              'block_id' => ContentBuilder::CustomBlock.last.id,
              'find' => 'data.rows.length',
              'replace' => 'data.rows.length * 1'
            }, id: 'tu_2')
          else done
          end
        end

        suppress(described_class::ComposeError) { composer.compose }

        expect(tool_results.last[:content].first[:text]).to include 'Edited'
      end

      it 'refuses to edit a block this run never authored' do
        stub_converse(
          tool_call('edit_source', {
            'block_id' => SecureRandom.uuid, 'find' => 'a', 'replace' => 'b'
          }),
          write_layout(text_layout),
          done
        )

        composer.compose

        expect(tool_results.first[:status]).to eq 'error'
        expect(tool_results.first[:content].first[:text]).to include 'was authored in this run'
      end
    end

    describe 'the automatic review when the model stops' do
      # Believing the report is finished is not the same as seeing it render.
      it 'renders what was written and accepts it when nothing is wrong' do
        stub_render(checks: [{ 'id' => 'mounted', 'ok' => true, 'message' => 'ok' }])
        stub_converse(write_layout(text_layout), done)

        expect(checking_composer.compose).to eq text_layout
        expect(sandbox).to have_received(:render).once
      end

      it 'gives the model one round to fix what the render found' do
        stub_render(checks: [{ 'id' => 'no_overflow', 'ok' => false, 'message' => 'Too wide.' }])
        fixed = {
          'ROOT' => text_layout['ROOT'].merge('nodes' => %w[textnode01 textnode09]),
          'textnode09' => node('TextMultiloc', { 'text' => { 'en' => '<p>Narrower</p>' } })
        }
        stub_converse(
          write_layout(text_layout),
          done,
          tool_call('patch_layout', { 'nodes' => fixed }, id: 'tu_fix'),
          done('Narrowed it.')
        )

        expect(checking_composer.compose.keys).to include 'textnode09'
      end

      it 'keeps the report when the model will not improve on it, and takes that for an answer' do
        stub_render(checks: [{ 'id' => 'no_overflow', 'ok' => false, 'message' => 'Too wide.' }])
        stub_converse(write_layout(text_layout), done, done('That is as good as it gets.'))

        expect(checking_composer.compose).to eq text_layout
        # Two rounds to write, one to decline: no nudging it to fix what it declined to.
        expect(client).to have_received(:converse).exactly(3).times
      end
    end

    describe 'the record of the run' do
      it 'keeps every message in order, so a failed run can be read back' do
        stub_converse(write_layout(text_layout), done)

        composer.compose

        expect(composer.transcript.first).to include(role: 'user')
        expect(composer.transcript.map { |m| m[:role] }).to include 'assistant'
      end

      it 'keeps the review conversation in the record as well' do
        stub_render(checks: [{ 'id' => 'no_overflow', 'ok' => false, 'message' => 'Too wide.' }])
        stub_converse(write_layout(text_layout), done, done('That is as good as it gets.'))

        checking_composer.compose

        texts = checking_composer.transcript.flat_map { |m| m[:content] }.filter_map { |c| c[:text] }
        expect(texts.first).to include 'Generate the report.'
        expect(texts).to include a_string_including('I rendered the report you just wrote')
        expect(texts.last).to eq 'That is as good as it gets.'
      end

      it 'adds up what the run cost' do
        stub_converse(write_layout(text_layout), done)

        composer.compose

        expect(composer.usage['input_tokens']).to eq 200
        expect(composer.usage['output_tokens']).to eq 40
      end

      it 'says the run finished because the model stopped' do
        stub_converse(write_layout(text_layout), done)

        composer.compose

        expect(composer.stopped_because).to eq 'done'
      end

      it 'says the run ran out of rounds' do
        stub_converse(tool_call('patch_layout', { 'nodes' => text_layout }))

        composer.compose

        expect(composer.stopped_because).to eq 'round_cap'
      end

      it 'keeps the transcript of a run that wrote nothing' do
        stub_converse(respond_with([content_block_class.new('no tools for me', nil)], 'end_turn'))

        suppress(described_class::ComposeError) { composer.compose }

        expect(composer.transcript).not_to be_empty
        expect(composer.stopped_because).to eq 'round_cap'
      end

      it 'stops when the turn has used up its hour, and keeps what was written' do
        stub_converse(write_layout(text_layout), tool_call('get_layout', {}, id: 'tu_2'), done)
        # The clock is read between rounds; here it runs out after the first.
        allow(composer).to receive(:turn_over?).and_return(false, true)

        expect(composer.compose).to eq text_layout
        expect(composer.stopped_because).to eq 'timeout'
        expect(client).to have_received(:converse).once
      end

      it 'stops when the admin pressed stop, and keeps what was written' do
        run = create(:generation_transcript, report: create(:report, project: project), stopped_because: nil)
        composer = described_class.new(project, locale: 'en', client: client, run_record: run)
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          run.update!(cancel_requested_at: Time.current)
          write_layout(text_layout)
        end

        expect(composer.compose).to eq text_layout
        expect(composer.stopped_because).to eq 'cancelled'
        expect(client).to have_received(:converse).once
      end

      it 'fails a cancelled run that had written nothing, and says why' do
        run = create(:generation_transcript, report: create(:report, project: project), stopped_because: nil)
        composer = described_class.new(project, locale: 'en', client: client, run_record: run)
        allow(client).to receive(:converse) do
          run.update!(cancel_requested_at: Time.current)
          tool_call('get_layout', {})
        end

        expect { composer.compose }.to raise_error(described_class::ComposeError, /cancelled/)
        expect(composer.stopped_because).to eq 'cancelled'
      end

      it 'does not let the review pass change a finished run into one that ran out of rounds' do
        stub_render(checks: [{ 'id' => 'no_overflow', 'ok' => false, 'message' => 'Too wide.' }])
        stub_converse(write_layout(text_layout), done, tool_call('get_layout', {}, id: 'tu_r'))

        checking_composer.compose

        expect(checking_composer.stopped_because).to eq 'done'
      end
    end

    describe 'a tool that breaks on our side' do
      it 'is reported to the model rather than ending the run' do
        allow(ContentBuilder::Craftjs::Query).to receive(:subtree_ids).and_raise(NoMethodError, 'boom')
        allow(ErrorReporter).to receive(:report)
        stub_render
        stub_converse(
          write_layout(text_layout), tool_call('check', { 'node_id' => 'textnode01' }, id: 'tu_2'), done
        )

        expect(checking_composer.compose).to eq text_layout
        expect(tool_results.last[:status]).to eq 'error'
        expect(tool_results.last[:content].first[:text]).to include 'failed on our side'
        expect(ErrorReporter).to have_received(:report).with(kind_of(NoMethodError), extra: { tool: 'check' })
      end
    end

    describe 'read_docs' do
      it 'reads the notes on a topic' do
        stub_converse(tool_call('read_docs', { 'topic' => 'recharts' }), write_layout(text_layout, id: 'tu_2'), done)

        composer.compose

        expect(tool_results.first[:status]).to eq 'success'
        expect(tool_results.first[:content].first[:text]).to include 'ResponsiveContainer'
      end

      it 'lists the topics when asked for one that does not exist' do
        stub_converse(tool_call('read_docs', { 'topic' => 'magic' }), write_layout(text_layout, id: 'tu_2'), done)

        composer.compose

        expect(tool_results.first[:status]).to eq 'error'
        expect(tool_results.first[:content].first[:text]).to include 'config, layout, queries, recharts'
      end
    end

    describe '#revise' do
      let(:history) do
        [
          { role: 'user', content: [{ text: 'Generate the report.' }] },
          { role: 'assistant', content: [{ text: 'Wrote the report.' }] }
        ]
      end

      it 'continues the conversation it was given, with the report and the request in the new turn' do
        stub_converse(done('It shows weekly participants.'))

        result = composer.revise(current_layout: text_layout, instruction: 'what does chart 1 show?', history: history)

        expect(result).to eq(layout: nil, reply: 'It shows weekly participants.')
        sent = sent_messages.first
        expect(sent.first(2)).to eq history
        expect(sent.last[:role]).to eq 'user'
        expect(sent.last[:content].first[:text]).to include 'what does chart 1 show?'
        expect(sent.last[:content].first[:text]).to include 'textnode01'
        expect(sent.last[:content].first[:text]).not_to include 'Project context'
      end

      it 'introduces the project when there is no conversation to continue' do
        stub_converse(done('Sure.'))

        composer.revise(current_layout: text_layout, instruction: 'hello', history: [])

        expect(sent_messages.first.last[:content].first[:text]).to include project.title_multiloc['en']
      end

      it 'records only what this turn added' do
        stub_converse(done('Sure.'))

        composer.revise(current_layout: text_layout, instruction: 'hello', history: history)

        expect(composer.transcript.size).to eq 4
        expect(composer.turn_messages.size).to eq 2
        expect(composer.turn_messages.first[:role]).to eq 'user'
      end

      it 'says the turn finished' do
        stub_converse(done('Sure.'))

        composer.revise(current_layout: text_layout, instruction: 'hello', history: history)

        expect(composer.stopped_because).to eq 'done'
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

      it 'refuses a chart node pointing at a version that was never written' do
        allow(client).to receive(:converse) do |args|
          sent_messages << args[:messages].deep_dup
          case sent_messages.size
          when 1 then tool_call('author_chart_block', authored)
          when 2
            block_id = ContentBuilder::CustomBlock.last.id
            write_layout(
              layout_with('chartnode1' => node('CustomBlock', { 'blockId' => block_id, 'version' => 7 }))
            )
          when 3 then write_layout(text_layout, id: 'tu_3')
          else done
          end
        end

        composer.compose

        expect(tool_results.map { |result| result[:content].first[:text] })
          .to include a_string_including('version 7, which does not exist (the latest is 1)')
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
