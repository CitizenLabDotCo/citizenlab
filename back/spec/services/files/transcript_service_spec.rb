# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::TranscriptService, type: :service do
  let(:service) { described_class.new(file) }
  let(:file) { create(:file, name: 'david.mp3') }
  let(:mock_client) { instance_double(AssemblyAIClient) }

  before do
    allow(AssemblyAIClient).to receive(:new).and_return(mock_client)
    # If we'd set ai_processing_allowed to true in the factory, the uploader
    # runs the description job which fails. Be updating it here instead, we
    # avoid the execution of the uploader callbacks in tests.
    file.update(ai_processing_allowed: true)
  end

  describe '#should_generate_transcript?' do
    context 'when all conditions are met' do
      it 'returns true' do
        expect(service.should_generate_transcript?).to be true
      end
    end

    context 'when AI processing is not allowed' do
      let(:file) { create(:file, ai_processing_allowed: false, mime_type: 'audio/mp3') }

      it 'returns false' do
        expect(service.should_generate_transcript?).to be false
      end
    end

    context 'when transcript already exists' do
      before { create(:file_transcript, file: file) }

      it 'returns false' do
        expect(service.should_generate_transcript?).to be false
      end
    end

    context 'when format is not supported' do
      let(:file) { create(:file, mime_type: 'text/plain') }

      it 'returns false' do
        expect(service.should_generate_transcript?).to be false
      end
    end
  end

  describe '#enqueue_transcript' do
    context 'when file is eligible' do
      it 'creates transcript record and enqueues job' do
        expect { service.enqueue_transcript }.to change(Files::Transcript, :count).by(1)

        transcript = Files::Transcript.last
        expect(transcript.file).to eq file
        expect(transcript.status).to eq 'pending'

        expect(Files::GenerateTranscriptJob).to have_been_enqueued.with(transcript)
      end
    end

    context 'when file is not eligible' do
      let(:file) { create(:file, ai_processing_allowed: false) }

      it 'does not create transcript or enqueue job' do
        expectation = expect { service.enqueue_transcript }
        expectation.not_to change(Files::Transcript, :count)
        expectation.not_to have_enqueued_job(Files::GenerateTranscriptJob)
      end
    end
  end

  describe '#submit_transcript' do
    let(:transcript) { create(:file_transcript, file: file, status: 'pending') }
    let(:assembly_response) { { 'id' => 'abc123' } }

    context 'when transcript is pending' do
      before do
        allow(mock_client).to receive(:submit_transcript_from_file).and_return(assembly_response)
        allow(file.content).to receive(:url).and_return('https://example.com/audio.mp3')
      end

      it 'submits to AssemblyAI and updates status' do
        service.submit_transcript(transcript)

        transcript.reload
        expect(transcript.status).to eq 'processing'
        expect(transcript.assemblyai_id).to eq 'abc123'

        expect(mock_client).to have_received(:submit_transcript_from_file).with(
          kind_of(StringIO),
          hash_including(
            punctuate: true,
            format_text: true,
            language_detection: true,
            speaker_labels: true
          )
        )
      end
    end

    context 'when AssemblyAI submission fails' do
      before do
        allow(mock_client).to receive(:submit_transcript_from_file).and_raise(AssemblyAIClient::ApiError, 'API Error')
      end

      it 'marks transcript as failed' do
        service.submit_transcript(transcript)

        transcript.reload
        expect(transcript.status).to eq 'failed'
        expect(transcript.error_message).to eq 'API Error'
      end
    end
  end

  describe '#check_transcript_status' do
    let(:transcript) { create(:file_transcript, file: file, status: 'processing', assemblyai_id: 'abc123') }

    context 'when transcript is completed on AssemblyAI' do
      let(:completed_response) do
        {
          'id' => 'abc123',
          'status' => 'completed',
          'text' => 'Hello world transcript',
          'confidence' => 0.95,
          'language_code' => 'en',
          'words' => [{ 'text' => 'Hello', 'start' => 0, 'end' => 100, 'confidence' => 0.99 }],
          'utterances' => [{ 'speaker' => 'A', 'text' => 'Hello world', 'start' => 0, 'end' => 200, 'confidence' => 0.95, 'words' => [] }],
          'audio_duration' => 120.5
        }
      end

      before do
        allow(mock_client).to receive(:get_transcript).with('abc123').and_return(completed_response)
      end

      it 'updates transcript with results' do
        service.check_transcript_status(transcript)

        transcript.reload
        expect(transcript.status).to eq 'completed'
        expect(transcript.assemblyai_transcript['text']).to eq 'Hello world transcript'
        expect(transcript.assemblyai_transcript['confidence']).to eq 0.95
        expect(transcript.assemblyai_transcript['language_code']).to eq 'en'
        expect(transcript.assemblyai_transcript['words']).to be_present
        expect(transcript.assemblyai_transcript['utterances']).to be_present
        expect(transcript.assemblyai_transcript['audio_duration']).to be_present
      end
    end

    context 'when transcript is still processing' do
      before do
        allow(mock_client).to receive(:get_transcript).with('abc123').and_return({ 'status' => 'processing' })
      end

      it 'keeps transcript in processing state' do
        service.check_transcript_status(transcript)

        transcript.reload
        expect(transcript.status).to eq 'processing'
      end
    end

    context 'when transcript failed on AssemblyAI' do
      before do
        allow(mock_client).to receive(:get_transcript).with('abc123').and_return({ 'status' => 'error', 'error' => 'Invalid audio format' })
      end

      it 'marks transcript as failed' do
        service.check_transcript_status(transcript)

        transcript.reload
        expect(transcript.status).to eq 'failed'
        expect(transcript.error_message).to eq 'Invalid audio format'
      end
    end

    context 'when transcript not found on AssemblyAI' do
      before do
        allow(mock_client).to receive(:get_transcript).with('abc123').and_raise(AssemblyAIClient::TranscriptNotFoundError)
      end

      it 'marks transcript as failed' do
        service.check_transcript_status(transcript)

        transcript.reload
        expect(transcript.status).to eq 'failed'
        expect(transcript.error_message).to eq 'Transcript not found on AssemblyAI'
      end
    end

    context 'when transcript is not processing' do
      let(:transcript) { create(:file_transcript, file: file, status: 'completed') }

      it 'does not check status with AssemblyAI' do
        allow(mock_client).to receive(:get_transcript)
        service.check_transcript_status(transcript)
        expect(mock_client).not_to have_received(:get_transcript)
      end
    end
  end
end
