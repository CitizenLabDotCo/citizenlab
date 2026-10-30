# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Turn do
  subject(:turn) { described_class.new(conversation) }

  let(:conversation) { create(:ai_assistant_conversation, status: 'running') }
  let(:phase) { conversation.subject }
  let!(:user_message) { create(:ai_assistant_message, conversation:, content: 'Create a survey about our park.') }

  def last_request_messages
    bedrock_requests.last['messages']
  end

  it 'stores a text reply and goes idle' do
    stub_bedrock(bedrock_text('Which topics should the survey cover?'))

    turn.run

    reply = conversation.messages.last
    expect(reply).to have_attributes(role: 'assistant', content: 'Which topics should the survey cover?', input_tokens: 100, output_tokens: 20)
    expect(conversation.reload).to have_attributes(status: 'idle', last_error_code: nil)
    expect(bedrock_requests.sole['system'].first['text']).to include('Go Vocal assistant', phase.title_multiloc['en'])
  end

  it 'only finishes a turn whose reply was already stored' do
    create(:ai_assistant_message, conversation:, role: 'assistant', content: 'Which topics should the survey cover?')
    stub_bedrock

    turn.run

    expect(bedrock_requests).to be_empty
    expect(conversation.reload).to have_attributes(status: 'idle', last_error_code: nil)
  end

  it 'continues a turn whose last message asked for tools' do
    tool_message = create(:ai_assistant_message, conversation:, role: 'assistant', content: nil)
    create(:ai_assistant_tool_call, message: tool_message, result: { fields: [] }.to_json)
    stub_bedrock(bedrock_text('The survey has no questions yet.'))

    turn.run

    expect(conversation.messages.last.content).to eq('The survey has no questions yet.')
  end

  it 'runs read-only tools right away, pinned to the conversation record' do
    other_phase = create(:native_survey_phase)
    stub_bedrock(
      bedrock_tool_use({ id: 'read_1', name: 'get_form_fields', input: { container_type: 'phase', container_id: other_phase.id } }),
      bedrock_text('The survey has one question.')
    )

    turn.run

    tool_call = AIAssistant::ToolCall.find_by!(tool_use_id: 'read_1')
    expect(tool_call).to have_attributes(status: 'auto_executed', arguments: {})
    expect(tool_call.result).to include(phase.id)
    expect(tool_call.result).not_to include(other_phase.id)
    tool_result = last_request_messages.last['content'].sole['toolResult']
    expect(tool_result).to include('toolUseId' => 'read_1')
    expect(conversation.reload.status).to eq('idle')
  end

  it 'marks calls to unknown tools as failed' do
    stub_bedrock(bedrock_tool_use({ id: 'x_1', name: 'delete_everything', input: {} }), bedrock_text('Never mind.'))

    turn.run

    expect(AIAssistant::ToolCall.sole).to have_attributes(status: 'failed', result: include('delete_everything'))
  end

  it 'stops the turn after too many tool calls' do
    stub_const("#{described_class}::MAX_TOOL_CALLS", 1)
    stub_bedrock(
      bedrock_tool_use(
        { id: 'read_1', name: 'get_form_fields' },
        { id: 'read_2', name: 'get_form_fields' },
        { id: 'read_3', name: 'get_form_fields' }
      )
    )

    turn.run

    # read_3 never ran: the limit stopped the turn at read_2.
    expect(AIAssistant::ToolCall.order(:tool_use_id).pluck(:status)).to eq(%w[auto_executed failed failed])
    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'tool_budget_exceeded')
  end

  it 'also stops the turn when the model keeps calling unknown tools' do
    stub_const("#{described_class}::MAX_TOOL_CALLS", 1)
    stub_bedrock(
      bedrock_tool_use({ id: 'x_1', name: 'delete_everything' }),
      bedrock_tool_use({ id: 'x_2', name: 'delete_everything' }),
      bedrock_text('Never mind.')
    )

    turn.run

    expect(bedrock_requests.size).to eq(2)
    expect(AIAssistant::ToolCall.order(:tool_use_id).pluck(:status)).to eq(%w[failed failed])
    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'tool_budget_exceeded')
  end

  it 'fails when the surface is no longer available' do
    phase.update_columns(participation_method: 'information')

    turn.run

    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'surface_unavailable')
  end

  describe 'replaying the conversation' do
    it 'adds a placeholder reply between two user messages' do
      create(:ai_assistant_message, conversation:, content: 'Are you there?')
      stub_bedrock(bedrock_text('Yes.'))

      turn.run

      messages = last_request_messages
      expect(messages.pluck('role')).to eq(%w[user assistant user])
      expect(messages[1]['content'].sole['text']).to eq(described_class::NO_REPLY_TEXT)
    end
  end
end
