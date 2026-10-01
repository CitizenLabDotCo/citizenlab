# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Conversation do
  describe '#expire_proposals!' do
    it 'expires the proposals and stops waiting for a decision' do
      tool_call = create(:ai_assistant_tool_call)
      conversation = tool_call.conversation
      conversation.update!(status: 'awaiting_approval')
      executed = create(:ai_assistant_tool_call, message: tool_call.message, status: 'executed', result: 'Done')

      conversation.expire_proposals!

      expect(tool_call.reload).to have_attributes(status: 'expired', result: include('expired'))
      expect(executed.reload.status).to eq('executed')
      expect(conversation.reload.status).to eq('idle')
    end
  end

  it 'is deleted with its phase' do
    conversation = create(:ai_assistant_conversation)

    expect { conversation.context.destroy! }.to change(described_class, :count).by(-1)
  end
end
