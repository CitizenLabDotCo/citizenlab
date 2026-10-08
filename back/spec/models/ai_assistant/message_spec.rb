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

  it 'requires content or files from the user' do
    message = build(:ai_assistant_message, conversation:, content: '')

    expect(message).not_to be_valid
    expect(message.errors.details[:content]).to include(error: :blank)
  end

  it 'limits the length of user messages only' do
    long_content = 'a' * (described_class::MAX_CONTENT_LENGTH + 1)

    expect(build(:ai_assistant_message, conversation:, content: long_content)).not_to be_valid
    expect(build(:ai_assistant_message, conversation:, role: 'assistant', content: long_content)).to be_valid
  end

  describe 'files', :active_job_que_adapter do
    let(:file) { create(:file, ai_processing_allowed: true) }

    it 'accepts PDF files that may be processed by AI' do
      expect(build(:ai_assistant_message, conversation:, file_ids: [file.id])).to be_valid
    end

    it 'refuses files that may not be processed by AI' do
      file.update!(ai_processing_allowed: false)
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :ai_processing_not_allowed)
    end

    it 'refuses unsupported file types' do
      file.update!(name: 'slides.pptx')
      message = build(:ai_assistant_message, conversation:, file_ids: [file.id])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :unsupported_file_type)
    end

    it 'refuses unknown files' do
      message = build(:ai_assistant_message, conversation:, file_ids: [SecureRandom.uuid])

      expect(message).not_to be_valid
      expect(message.errors.details[:file_ids]).to include(error: :not_found)
    end
  end
end
