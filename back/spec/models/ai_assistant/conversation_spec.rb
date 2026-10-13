# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Conversation do
  it 'is deleted with its phase' do
    conversation = create(:ai_assistant_conversation)

    expect { conversation.context.destroy! }.to change(described_class, :count).by(-1)
  end
end
