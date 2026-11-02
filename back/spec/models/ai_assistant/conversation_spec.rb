# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::Conversation do
  describe '#expire_calls_awaiting_approval!' do
    it 'expires the calls awaiting approval and stops waiting for a decision' do
      tool_call = create(:ai_assistant_tool_call)
      conversation = tool_call.conversation
      conversation.update!(status: 'awaiting_approval')
      executed = create(:ai_assistant_tool_call, message: tool_call.message, status: 'executed', result: 'Done')

      conversation.expire_calls_awaiting_approval!

      expect(tool_call.reload).to have_attributes(status: 'expired', result: include('expired'))
      expect(executed.reload.status).to eq('executed')
      expect(conversation.reload.status).to eq('idle')
    end
  end

  it 'is deleted with its phase' do
    conversation = create(:ai_assistant_conversation)

    expect { conversation.subject.destroy! }.to change(described_class, :count).by(-1)
  end

  describe '#fail_turn!' do
    it 'also fails the calls that never ran' do
      conversation = create(:ai_assistant_conversation, status: 'running')
      message = create(:ai_assistant_message, conversation:, role: 'assistant', content: nil)
      cut_off = create(:ai_assistant_tool_call, message:, status: 'pending')
      done = create(:ai_assistant_tool_call, message:, status: 'auto_executed')

      conversation.fail_turn!('turn_timed_out')

      expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'turn_timed_out')
      expect(cut_off.reload.status).to eq('failed')
      expect(done.reload.status).to eq('auto_executed')
    end

    it 'expires the calls awaiting approval' do
      conversation = create(:ai_assistant_conversation, status: 'running')
      tool_call = create(:ai_assistant_tool_call, message: create(:ai_assistant_message, conversation:, role: 'assistant', content: nil))

      conversation.fail_turn!('turn_timed_out')

      expect(tool_call.reload.status).to eq('expired')
      expect(conversation.reload.status).to eq('failed')
    end
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

    context 'while awaiting approval' do
      let(:conversation) { create(:ai_assistant_conversation, status: 'awaiting_approval') }
      let(:message) { create(:ai_assistant_message, conversation:, role: 'assistant', content: nil) }

      where(:call_status, :age, :new_call_status, :new_conversation_status) do
        'approved'          | 11.minutes | 'failed'            | 'idle'
        'approved'          | 1.minute   | 'approved'          | 'awaiting_approval'
        'awaiting_approval' | 25.hours   | 'expired'           | 'idle'
        'awaiting_approval' | 1.hour     | 'awaiting_approval' | 'awaiting_approval'
        'rejected'          | 1.minute   | 'rejected'          | 'idle'
      end

      with_them do
        it 'ends the decisions that nothing would end anymore' do
          tool_call = create(:ai_assistant_tool_call, message:, status: call_status, created_at: age.ago, decided_at: age.ago)

          conversation.recover_if_stuck!

          expect(tool_call.reload.status).to eq(new_call_status)
          expect(conversation.reload.status).to eq(new_conversation_status)
        end
      end

      it 'keeps waiting for the other calls after an interrupted approval' do
        interrupted = create(:ai_assistant_tool_call, message:, status: 'approved', decided_at: 11.minutes.ago)
        create(:ai_assistant_tool_call, message:, status: 'awaiting_approval')

        conversation.recover_if_stuck!

        expect(interrupted.reload.status).to eq('failed')
        expect(conversation.reload.status).to eq('awaiting_approval')
      end
    end
  end
end
