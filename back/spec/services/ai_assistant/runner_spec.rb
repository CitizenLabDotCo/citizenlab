# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Runner do
  subject(:runner) { described_class.new(conversation) }

  let(:conversation) { create(:ai_assistant_conversation, status: 'running') }
  let(:phase) { conversation.context }
  let!(:user_message) { create(:ai_assistant_message, conversation:, content: 'Create a survey about our park.') }

  let(:valid_fields) do
    [
      { input_type: 'page', page_layout: 'default', title_multiloc: {} },
      { input_type: 'text', title_multiloc: { 'en' => 'What do you like about the park?' }, required: false, enabled: true },
      { input_type: 'page', page_layout: 'default', key: 'form_end', title_multiloc: {} }
    ]
  end

  def last_request_messages
    bedrock_requests.last['messages']
  end

  it 'stores a text reply and goes idle' do
    stub_bedrock(bedrock_text('Which topics should the survey cover?'))

    runner.run

    reply = conversation.messages.last
    expect(reply).to have_attributes(role: 'assistant', content: 'Which topics should the survey cover?', input_tokens: 100, output_tokens: 20)
    expect(conversation.reload).to have_attributes(status: 'idle', last_error_code: nil)
    expect(bedrock_requests.sole['system'].first['text']).to include('Go Vocal assistant', phase.title_multiloc['en'])
  end

  it 'runs read-only tools right away, pinned to the conversation record' do
    other_phase = create(:native_survey_phase)
    stub_bedrock(
      bedrock_tool_use({ id: 'read_1', name: 'get_form_fields', input: { container_type: 'phase', container_id: other_phase.id } }),
      bedrock_text('The survey has one question.')
    )

    runner.run

    tool_call = AIAssistant::ToolCall.find_by!(tool_use_id: 'read_1')
    expect(tool_call).to have_attributes(status: 'auto_executed', arguments: {})
    expect(tool_call.result).to include(phase.id)
    expect(tool_call.result).not_to include(other_phase.id)
    tool_result = last_request_messages.last['content'].sole['toolResult']
    expect(tool_result).to include('toolUseId' => 'read_1')
    expect(conversation.reload.status).to eq('idle')
  end

  it 'only proposes write tool calls, and stops the turn' do
    stub_bedrock(bedrock_tool_use({ id: 'write_1', name: 'replace_form_fields', input: { fields: valid_fields } }, text: 'Here is a first draft.'))

    expect { runner.run }.not_to change { phase.reload.custom_form }

    tool_call = AIAssistant::ToolCall.find_by!(tool_use_id: 'write_1')
    expect(tool_call).to have_attributes(status: 'proposed', result: nil)
    expect(tool_call.arguments['fields'].size).to eq(3)
    expect(tool_call.bound_arguments).to eq('container_type' => 'phase', 'container_id' => phase.id)
    expect(tool_call.message.content).to eq('Here is a first draft.')
    expect(bedrock_requests.size).to eq(1)
    expect(conversation.reload.status).to eq('awaiting_approval')
  end

  it 'snapshots the form version with the proposal' do
    form = create(:custom_form, participation_context: phase, fields_last_updated_at: 1.hour.ago)
    stub_bedrock(bedrock_tool_use({ id: 'write_1', name: 'replace_form_fields', input: { fields: valid_fields } }))

    runner.run

    expect(AIAssistant::ToolCall.sole.bound_arguments['fields_last_updated_at']).to eq(form.fields_last_updated_at.iso8601)
  end

  it 'sends invalid write calls back to the model instead of proposing them' do
    stub_bedrock(
      bedrock_tool_use({ id: 'write_1', name: 'replace_form_fields', input: { fields: 'not a list' } }),
      bedrock_text('Sorry, let me try again later.')
    )

    runner.run

    expect(AIAssistant::ToolCall.sole).to have_attributes(status: 'failed', result: start_with('Error:'))
    tool_result = last_request_messages.last['content'].sole['toolResult']
    expect(tool_result['content'].sole['text']).to start_with('Error:')
    expect(conversation.reload.status).to eq('idle')
  end

  it 'marks calls to unknown tools as failed' do
    stub_bedrock(bedrock_tool_use({ id: 'x_1', name: 'delete_everything', input: {} }), bedrock_text('Never mind.'))

    runner.run

    expect(AIAssistant::ToolCall.sole).to have_attributes(status: 'failed', result: include('delete_everything'))
  end

  it 'stops the turn after too many tool calls' do
    stub_const("#{described_class}::MAX_TOOL_CALLS", 1)
    stub_bedrock(
      bedrock_tool_use({ id: 'read_1', name: 'get_form_fields' }, { id: 'read_2', name: 'get_form_fields' })
    )

    runner.run

    expect(AIAssistant::ToolCall.order(:tool_use_id).pluck(:status)).to eq(%w[auto_executed failed])
    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'tool_budget_exceeded')
  end

  it 'fails when the context is no longer available' do
    phase.update_columns(participation_method: 'information')

    runner.run

    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'context_unavailable')
  end

  describe 'replaying the conversation' do
    it 'continues after a decision with the outcome as tool result, without a new user message' do
      assistant_message = create(:ai_assistant_message, conversation:, role: 'assistant', content: 'A first draft.')
      create(
        :ai_assistant_tool_call,
        message: assistant_message,
        tool_use_id: 'write_1',
        status: 'rejected',
        result: { denied: true, reason: 'Fewer questions' }.to_json
      )
      stub_bedrock(bedrock_text('I will make it shorter.'))

      runner.run

      messages = last_request_messages
      expect(messages.pluck('role')).to eq(%w[user assistant user])
      expect(messages[1]['content'].pluck('toolUse').compact.sole).to include('toolUseId' => 'write_1')
      expect(messages[2]['content'].sole['toolResult']['content'].sole['text']).to include('Fewer questions')
    end

    it 'adds a placeholder reply between two user messages' do
      create(:ai_assistant_message, conversation:, content: 'Are you there?')
      stub_bedrock(bedrock_text('Yes.'))

      runner.run

      messages = last_request_messages
      expect(messages.pluck('role')).to eq(%w[user assistant user])
      expect(messages[1]['content'].sole['text']).to eq(described_class::NO_REPLY_TEXT)
    end

    it 'attaches the files of user messages', :active_job_que_adapter do
      file = create(:file, projects: [phase.project], ai_processing_allowed: true)
      user_message.update!(file_ids: [file.id])
      stub_bedrock(bedrock_text('Thanks for the document.'))

      runner.run

      blocks = last_request_messages.first['content']
      expect(blocks.first['text']).to eq('Create a survey about our park.')
      expect(blocks.pluck('document').compact.sole).to include('format' => 'pdf')
    end
  end
end
