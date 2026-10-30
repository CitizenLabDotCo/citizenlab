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
