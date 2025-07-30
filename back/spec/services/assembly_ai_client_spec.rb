# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AssemblyAIClient, type: :service do
  let(:api_key) { 'test_api_key' }
  let(:client) { described_class.new(api_key: api_key) }
  let(:audio_url) { 'https://example.com/audio.mp3' }
  let(:transcript_id) { 'abc123' }

  before do
    stub_const('ENV', ENV.to_hash.merge('ASSEMBLYAI_API_KEY' => nil))
  end

  describe '#initialize' do
    it 'accepts an API key parameter' do
      expect { described_class.new(api_key: api_key) }.not_to raise_error
    end

    it 'uses ENV variable when no API key provided' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('ASSEMBLYAI_API_KEY').and_return('env_key')
      client = described_class.new
      expect(client.send(:api_key)).to eq('env_key')
    end

    it 'raises error when no API key is available' do
      expect { described_class.new }.to raise_error(ArgumentError, 'AssemblyAI API key is required')
    end
  end

  describe '#submit_transcript' do
    let(:expected_payload) do
      {
        audio_url: audio_url,
        punctuate: true,
        format_text: true,
        language_detection: true,
        speaker_labels: true
      }
    end

    let(:success_response) do
      {
        'id' => transcript_id,
        'status' => 'queued',
        'audio_url' => audio_url
      }
    end

    before do
      stub_request(:post, 'https://api.assemblyai.com/v2/transcript')
        .with(
          body: expected_payload.to_json,
          headers: {
            'Authorization' => api_key,
            'Content-Type' => 'application/json'
          }
        )
        .to_return(
          status: 200,
          body: success_response.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
    end

    it 'submits transcript request with default options' do
      result = client.submit_transcript(audio_url)
      expect(result).to eq(success_response)
    end

    it 'merges custom options with defaults' do
      custom_options = { summarization: true, language_code: 'es' }
      expected_custom_payload = expected_payload.merge(custom_options)

      stub_request(:post, 'https://api.assemblyai.com/v2/transcript')
        .with(body: expected_custom_payload.to_json)
        .to_return(status: 200, body: success_response.to_json)

      result = client.submit_transcript(audio_url, custom_options)
      expect(result).to eq(success_response)
    end

    context 'when API returns error' do
      it 'raises AuthenticationError for 401' do
        stub_request(:post, 'https://api.assemblyai.com/v2/transcript')
          .to_return(status: 401)

        expect { client.submit_transcript(audio_url) }
          .to raise_error(AssemblyAIClient::AuthenticationError, 'Invalid API key')
      end

      it 'raises RateLimitError for 429' do
        stub_request(:post, 'https://api.assemblyai.com/v2/transcript')
          .to_return(status: 429)

        expect { client.submit_transcript(audio_url) }
          .to raise_error(AssemblyAIClient::RateLimitError, 'Rate limit exceeded')
      end

      it 'raises ApiError for other client errors' do
        error_response = { 'error' => 'Invalid audio URL' }
        stub_request(:post, 'https://api.assemblyai.com/v2/transcript')
          .to_return(status: 400, body: error_response.to_json)

        expect { client.submit_transcript(audio_url) }
          .to raise_error(AssemblyAIClient::ApiError, 'API error (400): Invalid audio URL')
      end
    end
  end

  describe '#get_transcript' do
    let(:completed_response) do
      {
        'id' => transcript_id,
        'status' => 'completed',
        'text' => 'This is the transcribed text.',
        'confidence' => 0.95,
        'words' => [
          { 'text' => 'This', 'start' => 0, 'end' => 200, 'confidence' => 0.99 }
        ]
      }
    end

    before do
      stub_request(:get, "https://api.assemblyai.com/v2/transcript/#{transcript_id}")
        .with(headers: { 'Authorization' => api_key })
        .to_return(
          status: 200,
          body: completed_response.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
    end

    it 'retrieves transcript data' do
      result = client.get_transcript(transcript_id)
      expect(result).to eq(completed_response)
    end

    context 'when transcript not found' do
      it 'raises TranscriptNotFoundError for 404' do
        stub_request(:get, "https://api.assemblyai.com/v2/transcript/#{transcript_id}")
          .to_return(status: 404)

        expect { client.get_transcript(transcript_id) }
          .to raise_error(AssemblyAIClient::TranscriptNotFoundError, 'Transcript not found')
      end
    end
  end

  describe '#transcript_completed?' do
    context 'when transcript is completed' do
      before do
        allow(client).to receive(:get_transcript).with(transcript_id)
          .and_return({ 'status' => 'completed' })
      end

      it 'returns true' do
        expect(client.transcript_completed?(transcript_id)).to be true
      end
    end

    context 'when transcript is processing' do
      before do
        allow(client).to receive(:get_transcript).with(transcript_id)
          .and_return({ 'status' => 'processing' })
      end

      it 'returns false' do
        expect(client.transcript_completed?(transcript_id)).to be false
      end
    end

    context 'when transcript not found' do
      before do
        allow(client).to receive(:get_transcript).with(transcript_id)
          .and_raise(AssemblyAIClient::TranscriptNotFoundError)
      end

      it 'returns false' do
        expect(client.transcript_completed?(transcript_id)).to be false
      end
    end
  end

  describe '#healthy?' do
    context 'when API is accessible' do
      before do
        stub_request(:get, 'https://api.assemblyai.com/v2/transcript/list?limit=1')
          .to_return(status: 200, body: '{"transcripts": []}')
      end

      it 'returns true' do
        expect(client.healthy?).to be true
      end
    end

    context 'when API is not accessible' do
      before do
        stub_request(:get, 'https://api.assemblyai.com/v2/transcript/list?limit=1')
          .to_raise(Faraday::ConnectionFailed.new('Connection failed'))
      end

      it 'returns false' do
        expect(client.healthy?).to be false
      end
    end
  end
end
