# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AssemblyAIClient, type: :service do
  let(:client) { described_class.new }
  let(:audio_url) { 'https://example.com/audio.mp3' }
  let(:transcript_id) { 'e5f1bf25-d869-4bb3-81ee-87ac9c92dfd1' }

  describe '#submit_transcript_from_url' do
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
      { 'id' => 'e5f1bf25-d869-4bb3-81ee-87ac9c92dfd1', 'language_model' => 'assemblyai_default', 'acoustic_model' => 'assemblyai_default', 'language_code' => nil, 'status' => 'queued', 'audio_url' => 'https://example.com/audio.mp3', 'text' => nil, 'words' => nil, 'utterances' => nil, 'confidence' => nil, 'audio_duration' => nil, 'punctuate' => true, 'format_text' => true, 'dual_channel' => false, 'webhook_url' => nil, 'webhook_status_code' => nil, 'webhook_auth' => false, 'webhook_auth_header_name' => nil, 'speed_boost' => false, 'auto_highlights_result' => nil, 'auto_highlights' => false, 'audio_start_from' => nil, 'audio_end_at' => nil, 'word_boost' => [], 'boost_param' => nil, 'prompt' => nil, 'keyterms_prompt' => nil, 'filter_profanity' => false, 'redact_pii' => false, 'redact_pii_audio' => false, 'redact_pii_audio_quality' => nil, 'redact_pii_audio_options' => nil, 'redact_pii_policies' => nil, 'redact_pii_sub' => nil, 'speaker_labels' => true, 'speaker_options' => nil, 'content_safety' => false, 'iab_categories' => false, 'content_safety_labels' => {}, 'iab_categories_result' => {}, 'language_detection' => true, 'language_confidence_threshold' => nil, 'language_confidence' => nil, 'custom_spelling' => nil, 'throttled' => false, 'auto_chapters' => false, 'summarization' => false, 'summary_type' => nil, 'summary_model' => nil, 'custom_topics' => false, 'topics' => [], 'speech_threshold' => nil, 'speech_model' => nil, 'chapters' => nil, 'disfluencies' => false, 'entity_detection' => false, 'sentiment_analysis' => false, 'sentiment_analysis_results' => nil, 'entities' => nil, 'speakers_expected' => nil, 'summary' => nil, 'custom_topics_results' => nil, 'is_deleted' => nil, 'multichannel' => nil, 'project_id' => 667_342, 'token_id' => 673_447 }
    end

    it 'submits transcript request with default options' do
      VCR.use_cassette('assembly_ai/submit_transcript_from_url') do
        result = client.submit_transcript_from_url(audio_url)
        expect(result).to eq(success_response)
      end
    end

    context 'when API returns error' do
      it 'raises AuthenticationError for 401' do
        stub_request(:post, 'https://api.eu.assemblyai.com/v2/transcript')
          .to_return(status: 401)

        expect { client.submit_transcript_from_url(audio_url) }
          .to raise_error(AssemblyAIClient::AuthenticationError, 'Invalid API key')
      end

      it 'raises RateLimitError for 429' do
        stub_request(:post, 'https://api.eu.assemblyai.com/v2/transcript')
          .to_return(status: 429)

        expect { client.submit_transcript_from_url(audio_url) }
          .to raise_error(AssemblyAIClient::RateLimitError, 'Rate limit exceeded')
      end
    end
  end

  describe '#get_transcript' do
    let(:completed_response) do
      { 'id' => 'e5f1bf25-d869-4bb3-81ee-87ac9c92dfd1', 'language_model' => 'assemblyai_default', 'acoustic_model' => 'assemblyai_default', 'language_code' => nil, 'status' => 'error', 'audio_url' => 'https://example.com/audio.mp3', 'text' => nil, 'words' => nil, 'utterances' => nil, 'confidence' => nil, 'audio_duration' => 0, 'punctuate' => true, 'format_text' => true, 'dual_channel' => false, 'webhook_url' => nil, 'webhook_status_code' => nil, 'webhook_auth' => false, 'webhook_auth_header_name' => nil, 'speed_boost' => false, 'auto_highlights_result' => nil, 'auto_highlights' => false, 'audio_start_from' => nil, 'audio_end_at' => nil, 'word_boost' => [], 'boost_param' => nil, 'prompt' => nil, 'keyterms_prompt' => [], 'filter_profanity' => false, 'redact_pii' => false, 'redact_pii_audio' => false, 'redact_pii_audio_quality' => nil, 'redact_pii_audio_options' => nil, 'redact_pii_policies' => nil, 'redact_pii_sub' => nil, 'speaker_labels' => true, 'speaker_options' => nil, 'error' => 'Download error, unable to download https://example.com/audio.mp3. Please make sure the file exists and is accessible from the internet.', 'content_safety' => nil, 'iab_categories' => nil, 'content_safety_labels' => {}, 'iab_categories_result' => {}, 'language_detection' => true, 'language_confidence_threshold' => nil, 'language_confidence' => nil, 'custom_spelling' => nil, 'throttled' => false, 'auto_chapters' => false, 'summarization' => false, 'summary_type' => nil, 'summary_model' => nil, 'custom_topics' => false, 'topics' => [], 'speech_threshold' => nil, 'speech_model' => nil, 'chapters' => nil, 'disfluencies' => false, 'entity_detection' => false, 'sentiment_analysis' => false, 'sentiment_analysis_results' => nil, 'entities' => nil, 'speakers_expected' => nil, 'summary' => nil, 'custom_topics_results' => nil, 'is_deleted' => nil, 'multichannel' => nil, 'project_id' => 667_342, 'token_id' => 673_447 }
    end

    it 'retrieves transcript data' do
      VCR.use_cassette('assembly_ai/get_transcript') do
        result = client.get_transcript(transcript_id)
        expect(result).to eq(completed_response)
      end
    end

    context 'when transcript not found' do
      it 'raises TranscriptNotFoundError for 404' do
        stub_request(:get, "https://api.eu.assemblyai.com/v2/transcript/#{transcript_id}")
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
end
