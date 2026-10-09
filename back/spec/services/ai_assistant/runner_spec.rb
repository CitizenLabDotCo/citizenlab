# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Runner do
  subject(:runner) { described_class.new(conversation) }

  let(:conversation) { create(:ai_assistant_conversation, status: 'running') }
  let(:phase) { conversation.context }
  let!(:user_message) { create(:ai_assistant_message, conversation:, content: 'Create a survey about our park.') }

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

  it 'fails when the context is no longer available' do
    phase.update_columns(participation_method: 'information')

    runner.run

    expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'context_unavailable')
  end

  describe 'replaying the conversation' do
    it 'adds a placeholder reply between two user messages' do
      create(:ai_assistant_message, conversation:, content: 'Are you there?')
      stub_bedrock(bedrock_text('Yes.'))

      runner.run

      messages = last_request_messages
      expect(messages.pluck('role')).to eq(%w[user assistant user])
      expect(messages[1]['content'].sole['text']).to eq(described_class::NO_REPLY_TEXT)
    end
  end
end
