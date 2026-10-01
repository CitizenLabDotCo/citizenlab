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

    it 'rejects a reason nothing produces' do
      transcript = described_class.new(report: report, stopped_because: 'bored')

      expect(transcript).to be_invalid
      expect(transcript.errors.details[:stopped_because]).to include(hash_including(error: :inclusion))
    end
  end

  describe 'when the report goes' do
    it 'takes the record of its runs with it' do
      described_class.create!(report: report)

      expect { report.destroy! }.to change(described_class, :count).by(-1)
    end
  end
end
