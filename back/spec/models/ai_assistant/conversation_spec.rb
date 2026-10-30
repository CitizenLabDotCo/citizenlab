# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Conversation do
  it 'is deleted with its phase' do
    conversation = create(:ai_assistant_conversation)

    expect { conversation.subject.destroy! }.to change(described_class, :count).by(-1)
  end

  describe '#recover_if_stuck!' do
    using RSpec::Parameterized::TableSyntax

    where(:status, :last_update, :new_status, :error_code) do
      'running' | 11.minutes.ago | 'failed'  | 'turn_timed_out'
      'running' | 1.minute.ago   | 'running' | nil
      'idle'    | 1.day.ago      | 'idle'    | nil
    end

    with_them do
      it 'fails a turn that made no progress for too long' do
        conversation = create(:ai_assistant_conversation, status:, updated_at: last_update)

        conversation.recover_if_stuck!

        expect(conversation.reload).to have_attributes(status: new_status, last_error_code: error_code)
      end
    end

    it 'counts a new message as progress' do
      conversation = create(:ai_assistant_conversation, status: 'running', updated_at: 11.minutes.ago)
      create(:ai_assistant_message, conversation:, role: 'assistant')

      conversation.reload.recover_if_stuck!

      expect(conversation.reload.status).to eq('running')
    end
  end
end
