# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::GenerationTranscript do
  let(:report) { create(:report) }

  describe '#rounds' do
    it 'counts what the model said, not what it was told' do
      transcript = described_class.create!(
        report: report,
        messages: [
          { 'role' => 'user', 'content' => [{ 'text' => 'Generate the report.' }] },
          { 'role' => 'assistant', 'content' => [{ 'text' => 'Looking.' }] },
          { 'role' => 'user', 'content' => [{ 'text' => 'result' }] },
          { 'role' => 'assistant', 'content' => [{ 'text' => 'Done.' }] }
        ]
      )

      expect(transcript.rounds).to eq 2
    end

    it 'is zero for a run that never got a reply' do
      expect(described_class.create!(report: report).rounds).to eq 0
    end
  end

  # Zero cache reads across a multi-round run means the prompt is not stable and every
  # round is being paid for in full — the number worth watching after a prompt change.
  describe '#cache_read_tokens' do
    it 'reads what the provider reported' do
      transcript = described_class.create!(report: report, usage: { 'cache_read_input_tokens' => 9000 })

      expect(transcript.cache_read_tokens).to eq 9000
    end

    it 'is zero when the provider said nothing about caching' do
      expect(described_class.create!(report: report).cache_read_tokens).to eq 0
    end
  end

  describe 'stopped_because' do
    it 'accepts every reason a run can end' do
      described_class::STOP_REASONS.each do |reason|
        expect(build(:generation_transcript, report: report, stopped_because: reason)).to be_valid
      end
    end

    it 'is nothing while the run is still going' do
      run = described_class.create!(report: report, stopped_because: nil)

      expect(run).to be_running
      expect(described_class.running).to include run
      expect(described_class.finished).not_to include run
    end

    it 'rejects a reason nothing produces' do
      transcript = described_class.new(report: report, stopped_because: 'bored')

      expect(transcript).to be_invalid
      expect(transcript.errors.details[:stopped_because]).to include(hash_including(error: :inclusion))
    end

    it 'knows which endings left the report unfinished' do
      early, whole = described_class::STOP_REASONS.partition do |reason|
        build(:generation_transcript, stopped_because: reason).stopped_early?
      end

      expect(early).to match_array %w[round_cap timeout cancelled]
      expect(whole).to match_array %w[done failed]
    end
  end

  describe 'kind' do
    it 'is a generation or a chat turn' do
      expect(build(:generation_transcript, kind: 'revision')).to be_valid
      expect(build(:generation_transcript, kind: 'daydream')).to be_invalid
    end
  end

  describe '.session_runs_for' do
    def run(kind, stopped: 'done', messages: 2, at: Time.current)
      create(:generation_transcript, report: report, kind: kind, stopped_because: stopped,
        messages: Array.new(messages) { |i| { 'role' => i.even? ? 'user' : 'assistant', 'content' => [] } },
        created_at: at)
    end

    it 'is the latest finished generation and the turns after it, oldest first' do
      run('generation', at: 3.hours.ago)
      run('revision', at: 2.hours.ago)
      latest = run('generation', at: 1.hour.ago)
      turn = run('revision', at: 30.minutes.ago)

      expect(described_class.session_runs_for(report)).to eq [latest, turn]
    end

    it 'leaves out a run that is still going' do
      generation = run('generation', at: 1.hour.ago)
      run('revision', stopped: nil, at: 1.minute.ago)

      expect(described_class.session_runs_for(report)).to eq [generation]
    end

    it 'is empty for a report no model has written' do
      run('revision', at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq []
    end

    it 'drops the oldest turns once the conversation would not fit, never the generation' do
      generation = run('generation', messages: described_class::MAX_HISTORY_MESSAGES - 3, at: 3.hours.ago)
      run('revision', messages: 2, at: 2.hours.ago)
      newest = run('revision', messages: 2, at: 1.hour.ago)

      expect(described_class.session_runs_for(report)).to eq [generation, newest]
    end
  end

  describe 'when the report goes' do
    it 'takes the record of its runs with it' do
      described_class.create!(report: report)

      expect { report.destroy! }.to change(described_class, :count).by(-1)
    end
  end
end
