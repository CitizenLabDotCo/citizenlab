# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AIAssistant::Run do
  subject(:run) { create(:ai_assistant_run) }

  def write(run, role, text)
    run.append_message!(role: role, model_text: text)
  end

  describe '#append_message!' do
    it 'adds the message to the conversation as part of this run' do
      first = write(run, 'user', 'Generate the report.')
      last = write(run, 'assistant', 'Done.')

      expect(run.conversation.messages).to eq [first, last]
      expect(run.messages).to eq [first, last]
    end

    it 'continues the numbering of the messages that came before it' do
      earlier = create(:ai_assistant_run, conversation: run.conversation)
      write(earlier, 'user', 'Generate the report.')

      expect(write(run, 'user', 'Shorter, please.').position).to eq 2
    end
  end

  describe '#messages' do
    it 'is what this run wrote, and nothing another run wrote' do
      earlier = create(:ai_assistant_run, conversation: run.conversation)
      write(earlier, 'user', 'Generate the report.')
      mine = write(run, 'user', 'Shorter, please.')

      expect(run.messages).to eq [mine]
    end

    it 'is nothing for a run that has not written yet' do
      expect(run.messages).to be_empty
    end
  end

  describe '#rounds' do
    it 'counts what the model said, not what it was told' do
      write(run, 'user', 'Generate the report.')
      write(run, 'assistant', 'Looking.')
      write(run, 'user', 'result')
      write(run, 'assistant', 'Done.')

      expect(run.rounds).to eq 2
    end

    it 'is zero for a run that never got a reply' do
      expect(run.rounds).to eq 0
    end
  end

  # Zero cache reads across a multi-round run means the prompt is not stable and every
  # round is being paid for in full — the number worth watching after a prompt change.
  describe '#cache_read_tokens' do
    it 'reads what the provider reported' do
      expect(create(:ai_assistant_run, usage: { 'cache_read_input_tokens' => 9000 }).cache_read_tokens).to eq 9000
    end

    it 'is zero when the provider said nothing about caching' do
      expect(create(:ai_assistant_run, usage: {}).cache_read_tokens).to eq 0
    end
  end

  # A run can stop for a respectable reason and still write nothing, which
  # stopped_because cannot tell apart.
  describe '#applied!' do
    it 'records when the work reached its subject' do
      expect { run.applied! }.to change(run, :applied?).from(false).to(true)
    end
  end

  describe 'stopped_because' do
    it 'accepts every reason a run can end' do
      described_class::STOP_REASONS.each do |reason|
        expect(build(:ai_assistant_run, stopped_because: reason)).to be_valid
      end
    end

    it 'is nothing while the run is still going' do
      going = create(:ai_assistant_run, stopped_because: nil)

      expect(going).to be_running
      expect(described_class.running).to include going
      expect(described_class.finished).not_to include going
    end

    it 'rejects a reason nothing produces' do
      invalid = build(:ai_assistant_run, stopped_because: 'bored')

      expect(invalid).to be_invalid
      expect(invalid.errors.details[:stopped_because]).to include(hash_including(error: :inclusion))
    end

    it 'knows which endings left the work unfinished' do
      early, whole = described_class::STOP_REASONS.partition do |reason|
        build(:ai_assistant_run, stopped_because: reason).stopped_early?
      end

      expect(early).to match_array %w[round_cap timeout cancelled]
      expect(whole).to match_array %w[done failed]
    end
  end

  # The messages are the conversation's history, which is read whole on the next turn.
  describe 'when a run goes' do
    it 'leaves the messages it wrote where they are' do
      message = write(run, 'user', 'Generate the report.')

      expect { run.destroy! }.not_to change(AIAssistant::Message, :count)
      expect(message.reload.run_id).to be_nil
    end
  end
end
