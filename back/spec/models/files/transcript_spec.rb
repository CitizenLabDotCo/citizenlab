# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::Transcript do
  describe 'associations' do
    it { is_expected.to belong_to(:file).class_name('Files::File') }
  end

  describe 'validations' do
    subject { build(:file_transcript) }

    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[pending processing completed failed]) }
    it { is_expected.to validate_uniqueness_of(:file_id).case_insensitive }

    describe 'JSON schema validations' do
      let(:transcript) { build(:file_transcript, :completed) }

      it 'validates against the JSON schema' do
        expect(transcript).to be_valid
      end

      it 'invalidates with incorrect JSON schema' do
        transcript.assemblyai_transcript = { 'text' => 5 }
        expect(transcript).not_to be_valid
      end
    end
  end

  describe 'scopes' do
    let!(:pending_transcript) { create(:file_transcript, status: 'pending') }
    let!(:processing_transcript) { create(:file_transcript, :processing) }
    let!(:completed_transcript) { create(:file_transcript, :completed) }
    let!(:failed_transcript) { create(:file_transcript, :failed) }

    describe '.pending' do
      it 'returns only pending transcripts' do
        expect(described_class.pending).to contain_exactly(pending_transcript)
      end
    end

    describe '.processing' do
      it 'returns only processing transcripts' do
        expect(described_class.processing).to contain_exactly(processing_transcript)
      end
    end

    describe '.completed' do
      it 'returns only completed transcripts' do
        expect(described_class.completed).to contain_exactly(completed_transcript)
      end
    end

    describe '.failed' do
      it 'returns only failed transcripts' do
        expect(described_class.failed).to contain_exactly(failed_transcript)
      end
    end
  end

  describe 'factory' do
    it 'has a valid factory' do
      expect(build(:file_transcript)).to be_valid
    end

    it 'has a valid processing factory' do
      expect(build(:file_transcript, :processing)).to be_valid
    end

    it 'has a valid completed factory' do
      expect(build(:file_transcript, :completed)).to be_valid
    end

    it 'has a valid failed factory' do
      expect(build(:file_transcript, :failed)).to be_valid
    end
  end
end
