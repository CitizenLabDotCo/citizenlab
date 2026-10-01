# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ToolCallDecider do
  let(:conversation) { create(:ai_assistant_conversation, status: 'awaiting_approval') }
  let(:user) { conversation.user }
  let(:phase) { conversation.context }
  let(:assistant_message) { create(:ai_assistant_message, conversation:, role: 'assistant', content: nil) }
  let(:fields) do
    [
      { 'input_type' => 'page', 'page_layout' => 'default', 'title_multiloc' => {} },
      { 'input_type' => 'text', 'title_multiloc' => { 'en' => 'What do you like?' }, 'required' => false, 'enabled' => true },
      { 'input_type' => 'page', 'page_layout' => 'default', 'key' => 'form_end', 'title_multiloc' => {} }
    ]
  end
  let(:bound_arguments) { { 'container_type' => 'phase', 'container_id' => phase.id } }
  let!(:tool_call) do
    create(:ai_assistant_tool_call, message: assistant_message, arguments: { 'fields' => fields }, bound_arguments:)
  end

  describe '#approve!' do
    it 'runs the tool as the user and continues the conversation' do
      expect { expect(described_class.new(tool_call, user).approve!).to eq(:ok) }
        .to have_enqueued_job(AIAssistant::TurnJob).with(conversation)
        .and have_enqueued_job(LogActivityJob).with(tool_call, 'approved', user, anything, hash_including(channel: 'ai_assistant'))

      expect(tool_call.reload).to have_attributes(status: 'executed', decided_by: user, decided_at: be_present)
      expect(tool_call.result).to include('Replaced fields')
      expect(phase.reload.custom_form.custom_fields.map(&:input_type)).to eq(%w[page text page])
      expect(conversation.reload.status).to eq('running')
    end

    it 'fails without changes when the form changed since the proposal' do
      create(:custom_form, participation_context: phase, fields_last_updated_at: Time.current)
      tool_call.update!(bound_arguments: bound_arguments.merge('fields_last_updated_at' => 1.hour.ago.iso8601))

      described_class.new(tool_call, user).approve!

      expect(tool_call.reload).to have_attributes(status: 'failed', result: include('stale_data'))
      expect(phase.custom_form.reload.custom_fields).to be_empty
    end

    it 'waits for the other proposals of the turn before continuing' do
      create(:ai_assistant_tool_call, message: assistant_message)

      expect { described_class.new(tool_call, user).approve! }.not_to have_enqueued_job(AIAssistant::TurnJob)
      expect(conversation.reload.status).to eq('awaiting_approval')
    end

    it 'refuses a call that was already decided' do
      tool_call.update!(status: 'rejected')

      expect(described_class.new(tool_call, user).approve!).to eq(:not_proposed)
    end

    it 'refuses when the conversation is not waiting for a decision' do
      conversation.update!(status: 'running')

      expect(described_class.new(tool_call, user).approve!).to eq(:busy)
    end

    it 'expires proposals older than the approval TTL' do
      tool_call.update!(created_at: 25.hours.ago)

      expect(described_class.new(tool_call, user).approve!).to eq(:expired)
      expect(tool_call.reload.status).to eq('expired')
      expect(conversation.reload.status).to eq('idle')
      expect(phase.reload.custom_form).to be_nil
    end
  end

  describe '#reject!' do
    it 'sends the reason back to the model without running the tool' do
      expect { described_class.new(tool_call, user).reject!('Fewer questions please') }
        .to have_enqueued_job(AIAssistant::TurnJob).with(conversation)

      expect(tool_call.reload).to have_attributes(status: 'rejected', reason: 'Fewer questions please', decided_by: user)
      expect(JSON.parse(tool_call.result)).to eq('denied' => true, 'reason' => 'Fewer questions please')
      expect(phase.reload.custom_form).to be_nil
    end
  end
end
