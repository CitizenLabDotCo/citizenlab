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
      let(:transcript) { build(:file_transcript) }

      context 'words validation' do
        it 'accepts valid words array' do
          transcript.words = [
            { 'text' => 'Hello', 'start' => 0.0, 'end' => 0.5, 'confidence' => 0.99 },
            { 'text' => 'world', 'start' => 0.5, 'end' => 1.0, 'confidence' => 0.98, 'speaker' => 'A' }
          ]
          expect(transcript).to be_valid
        end

        it 'rejects invalid words structure' do
          transcript.words = [{ 'invalid' => 'structure' }]
          expect(transcript).not_to be_valid
          expect(transcript.errors[:words]).to be_present
        end

        it 'accepts empty words array' do
          transcript.words = []
          expect(transcript).to be_valid
        end
      end

      context 'utterances validation' do
        it 'accepts valid utterances array' do
          transcript.utterances = [
            {
              'speaker' => 'A',
              'text' => 'Hello world',
              'start' => 0.0,
              'end' => 1.0,
              'confidence' => 0.95,
              'words' => []
            }
          ]
          expect(transcript).to be_valid
        end

        it 'rejects invalid utterances structure' do
          transcript.utterances = [{ 'invalid' => 'structure' }]
          expect(transcript).not_to be_valid
          expect(transcript.errors[:utterances]).to be_present
        end
      end

      context 'metadata validation' do
        it 'accepts any valid object structure' do
          transcript.metadata = { 'audio_duration' => 120, 'custom_field' => 'value' }
          expect(transcript).to be_valid
        end

        it 'rejects non-object types' do
          transcript.metadata = 'string'
          expect(transcript).not_to be_valid
          expect(transcript.errors[:metadata]).to be_present
        end
      end

      context 'features validation' do
        it 'accepts valid features object' do
          transcript.features = {
            'speaker_labels' => true,
            'summarization' => false,
            'custom_feature' => 'allowed'
          }
          expect(transcript).to be_valid
        end

        it 'accepts empty features object' do
          transcript.features = {}
          expect(transcript).to be_valid
        end
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

  describe 'status helper methods' do
    let(:transcript) { build(:file_transcript) }

    describe '#completed?' do
      it 'returns true when status is completed' do
        transcript.status = 'completed'
        expect(transcript.completed?).to be true
      end

      it 'returns false for other statuses' do
        transcript.status = 'pending'
        expect(transcript.completed?).to be false
      end
    end

    describe '#failed?' do
      it 'returns true when status is failed' do
        transcript.status = 'failed'
        expect(transcript.failed?).to be true
      end

      it 'returns false for other statuses' do
        transcript.status = 'completed'
        expect(transcript.failed?).to be false
      end
    end

    describe '#processing?' do
      it 'returns true when status is processing' do
        transcript.status = 'processing'
        expect(transcript.processing?).to be true
      end

      it 'returns false for other statuses' do
        transcript.status = 'pending'
        expect(transcript.processing?).to be false
      end
    end

    describe '#pending?' do
      it 'returns true when status is pending' do
        transcript.status = 'pending'
        expect(transcript.pending?).to be true
      end

      it 'returns false for other statuses' do
        transcript.status = 'processing'
        expect(transcript.pending?).to be false
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

    it 'has a valid with_summarization factory' do
      expect(build(:file_transcript, :with_summarization)).to be_valid
    end
  end
end
