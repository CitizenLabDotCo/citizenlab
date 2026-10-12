# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Message do
  let(:conversation) { create(:ai_assistant_conversation) }

  it 'numbers the messages of a conversation in order' do
    first = create(:ai_assistant_message, conversation:)
    second = create(:ai_assistant_message, conversation:, role: 'assistant', content: 'Hi')

    expect([first.position, second.position]).to eq([1, 2])
    expect(conversation.messages).to eq([first, second])
  end

  it 'requires content from the user' do
    message = build(:ai_assistant_message, conversation:, content: '')

    expect(message).not_to be_valid
    expect(message.errors.details[:content]).to include(error: :blank)
  end

  it 'limits the length of user messages only' do
    long_content = 'a' * (described_class::MAX_CONTENT_LENGTH + 1)

    expect(build(:ai_assistant_message, conversation:, content: long_content)).not_to be_valid
    expect(build(:ai_assistant_message, conversation:, role: 'assistant', content: long_content)).to be_valid
  end
end
