# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::TurnJob, :active_job_que_adapter do
  let(:conversation) { create(:ai_assistant_conversation, status: 'running') }
  let(:job) { described_class.perform_later(conversation) }

  it 'runs the turn of a running conversation' do
    runner = instance_double(AIAssistant::Runner, run: nil)
    allow(AIAssistant::Runner).to receive(:new).with(conversation).and_return(runner)

    job.perform_now

    expect(runner).to have_received(:run)
  end

  it 'does nothing for a conversation that is not running' do
    conversation.update!(status: 'idle')
    expect(AIAssistant::Runner).not_to receive(:new)

    job.perform_now
  end

  describe '#handle_error' do
    using RSpec::Parameterized::TableSyntax

    where(:error, :error_count, :expires) do
      RubyLLM::OverloadedError.new(nil, 'busy') | 1 | false
      RubyLLM::RateLimitError.new(nil, 'slow down') | 3 | true
      RubyLLM::BadRequestError.new(nil, 'bad') | 1 | true
      StandardError.new | 1 | true
    end

    with_them do
      it 'retries temporary LLM errors a few times, and expires on the rest' do
        allow(job).to receive(:error_count).and_return(error_count)

        if expires
          expect(job).to receive(:expire)
        else
          expect(job).not_to receive(:expire)
        end

        job.handle_error(error)
      end
    end
  end

  describe '#expire' do
    it 'marks the conversation as failed with an error code' do
      allow(job.send(:que_target)).to receive(:que_error).and_return(RubyLLM::ContextLengthExceededError.new(nil, 'too long'))

      job.send(:expire)

      expect(conversation.reload).to have_attributes(status: 'failed', last_error_code: 'context_too_long')
    end
  end
end
