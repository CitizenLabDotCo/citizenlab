# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::CustomBlockAuthoringService do
  let(:session) { create(:custom_block_ai_session) }
  let(:client) { instance_double(Aws::BedrockRuntime::Client) }
  let(:service) { described_class.new(client: client) }

  # Minimal stand-ins for the AWS SDK response structs.
  let(:content_block_class) { Struct.new(:text, :tool_use) }
  let(:tool_use_class) { Struct.new(:tool_use_id, :name, :input) }
  let(:response_class) { Struct.new(:output, :stop_reason) }
  let(:output_class) { Struct.new(:message) }
  let(:message_class) { Struct.new(:role, :content) }

  def respond_with(content_blocks, stop_reason)
    message = message_class.new('assistant', content_blocks)
    response_class.new(output_class.new(message), stop_reason)
  end

  describe '#run' do
    it 'appends the user message and the assistant reply to the transcript' do
      response = respond_with(
        [content_block_class.new('Here is a first version.', nil)], 'end_turn'
      )
      allow(client).to receive(:converse).and_return(response)

      result = service.run(session, user_message: 'Build a welcome block')

      expect(session.reload.transcript.length).to eq 2
      expect(session.transcript.first).to eq(
        'role' => 'user', 'content' => [{ 'text' => 'Build a welcome block' }]
      )
      expect(result[:assistant_text]).to eq 'Here is a first version.'
      expect(result[:tool_calls]).to be_empty
      expect(result[:stop_reason]).to eq 'end_turn'
    end

    it 'extracts tool calls from the assistant message' do
      blocks = [
        content_block_class.new('Writing the code now.', nil),
        content_block_class.new(
          nil, tool_use_class.new('tu_1', 'set_source', { 'source' => 'x' })
        )
      ]
      allow(client).to receive(:converse).and_return(respond_with(blocks, 'tool_use'))

      result = service.run(session, user_message: 'Build it')

      expect(result[:tool_calls]).to eq(
        [{ id: 'tu_1', name: 'set_source', input: { 'source' => 'x' } }]
      )
      expect(
        session.reload.transcript.last['content'].last['tool_use']['name']
      ).to eq 'set_source'
    end

    it 'sends tool results back as tool_result content blocks' do
      session.update!(transcript: [
        { 'role' => 'user', 'content' => [{ 'text' => 'Build it' }] },
        { 'role' => 'assistant', 'content' => [
          { 'tool_use' => { 'tool_use_id' => 'tu_1', 'name' => 'set_source', 'input' => {} } }
        ] }
      ])
      allow(client).to receive(:converse).and_return(
        respond_with([content_block_class.new('Done.', nil)], 'end_turn')
      )

      service.run(
        session,
        tool_results: [{ tool_use_id: 'tu_1', content: '{"ok":true}', is_error: false }]
      )

      expect(client).to have_received(:converse) do |args|
        tool_result = args[:messages].last[:content].first[:tool_result]
        expect(tool_result[:tool_use_id]).to eq 'tu_1'
        expect(tool_result[:status]).to eq 'success'
        expect(args[:tool_config][:tools].map { |tool| tool[:tool_spec][:name] })
          .to include 'set_source'
        expect(args[:system].first[:text]).to include 'gv-sdk'
      end
    end

    it 'refuses to grow the transcript past the cap' do
      session.update!(transcript: Array.new(described_class::MAX_TRANSCRIPT_MESSAGES) do
        { 'role' => 'user', 'content' => [{ 'text' => 'x' }] }
      end)

      expect do
        service.run(session, user_message: 'more')
      end.to raise_error(described_class::TranscriptTooLongError)
    end
  end
end
