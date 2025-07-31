# frozen_string_literal: true

module Files
  # Service to handle transcript generation for uploaded files
  class TranscriptService
    SUPPORTED_AUDIO_FORMATS = %w[
      audio/mpeg audio/mp3 audio/wav audio/flac audio/m4a audio/aac
      audio/oga audio/ogg application/ogg audio/opus
    ].freeze

    SUPPORTED_VIDEO_FORMATS = %w[
      video/mp4 video/quicktime video/x-msvideo video/x-matroska
      video/webm video/x-m4v
    ].freeze

    SUPPORTED_FORMATS = (SUPPORTED_AUDIO_FORMATS + SUPPORTED_VIDEO_FORMATS).freeze

    attr_reader :file

    def initialize(file)
      @file = file
    end

    # Check if the file should have a transcript generated
    # @return [Boolean] True if file is eligible for transcription
    def should_generate_transcript?
      return false unless file.ai_processing_allowed?
      return false if file.transcript.present?
      return false unless supported_format?

      true
    end

    # Enqueue transcript generation job if eligible
    # @return [Files::Transcript, nil] Created transcript record or nil
    def enqueue_transcript
      return unless should_generate_transcript?

      transcript = create_transcript_record
      Files::GenerateTranscriptJob.perform_later(transcript)
      transcript
    end

    # Submit transcript to AssemblyAI (used by background job)
    # @param transcript [Files::Transcript] Transcript record to process
    # @return [Files::Transcript] Updated transcript record
    def submit_transcript(transcript)
      return transcript unless transcript.pending?

      begin
        assemblyai_id = submit_to_assembly_ai(transcript)
        transcript.update!(
          status: 'processing',
          assemblyai_id: assemblyai_id
        )
      rescue StandardError => e
        handle_transcript_error(transcript, e)
      end

      transcript.reload
    end

    # Check transcript status and update if completed (used by background job)
    # @param transcript [Files::Transcript] Transcript record to check
    # @return [Files::Transcript] Updated transcript record
    def check_transcript_status(transcript)
      return transcript unless transcript.processing?
      return transcript if transcript.assemblyai_id.blank?

      begin
        client = AssemblyAIClient.new
        response = client.get_transcript(transcript.assemblyai_id)

        case response['status']
        when 'completed'
          update_transcript_with_results(transcript, response)
        when 'error'
          handle_transcript_error(transcript, StandardError.new(response['error'] || 'Transcription failed'))
        when 'queued', 'processing'
          # Still processing, will be checked again by re-enqueued job
        else
          handle_transcript_error(transcript, StandardError.new("Unknown status: #{response['status']}"))
        end
      rescue AssemblyAIClient::TranscriptNotFoundError
        handle_transcript_error(transcript, StandardError.new('Transcript not found on AssemblyAI'))
      rescue StandardError => e
        handle_transcript_error(transcript, e)
      end

      transcript.reload
    end

    private

    def supported_format?
      return false if file.mime_type.blank?

      SUPPORTED_FORMATS.include?(file.mime_type.downcase)
    end

    def create_transcript_record
      Files::Transcript.create!(
        file: file,
        status: 'pending'
      )
    end

    def submit_to_assembly_ai(_transcript)
      client = AssemblyAIClient.new

      # Get publicly accessible URL for the file
      # file_url = file.content.url
      # unless file_url.start_with?('http')
      #   # Convert relative URL to absolute URL
      #   base_url = Rails.application.routes.default_url_options[:host] || 'localhost:3000'
      #   protocol = Rails.env.production? ? 'https' : 'http'
      #   file_url = "#{protocol}://#{base_url}#{file_url}"
      # end
      # response = client.submit_transcript_from_url(file_url, transcript_options)

      response = client.submit_transcript_from_file(file.content.file.file, transcript_options)
      response['id']
    end

    def update_transcript_with_results(transcript, response)
      transcript.update!(
        status: 'completed',
        text: response['text'],
        confidence: response['confidence'],
        language_code: response['language_code'],
        words: response['words'] || [],
        utterances: response['utterances'] || [],
        metadata: extract_metadata(response),
        features: extract_features(response)
      )
    end

    def extract_metadata(response)
      metadata = {}

      # Core metadata from AssemblyAI
      metadata['audio_duration'] = response['audio_duration'] if response['audio_duration']
      metadata['audio_url'] = response['audio_url'] if response['audio_url']
      metadata['punctuate'] = response['punctuate'] if response.key?('punctuate')
      metadata['format_text'] = response['format_text'] if response.key?('format_text')
      metadata['dual_channel'] = response['dual_channel'] if response.key?('dual_channel')
      metadata['speed_boost'] = response['speed_boost'] if response.key?('speed_boost')

      metadata
    end

    def extract_features(response)
      features = {}

      # Enabled features
      features['speaker_labels'] = response['speaker_labels'] if response.key?('speaker_labels')
      features['summarization'] = response['summarization'] if response.key?('summarization')
      features['auto_highlights'] = response['auto_highlights'] if response.key?('auto_highlights')
      features['content_safety'] = response['content_safety_labels'] if response.key?('content_safety_labels')
      features['entity_detection'] = response['entities'] if response.key?('entities')
      features['sentiment_analysis'] = response['sentiment_analysis_results'] if response.key?('sentiment_analysis_results')

      # Store actual results for enabled features
      features['summary'] = response['summary'] if response['summary']
      features['auto_highlights_result'] = response['auto_highlights_result'] if response['auto_highlights_result']
      features['content_safety_results'] = response['content_safety_labels'] if response['content_safety_labels']
      features['entities'] = response['entities'] if response['entities']
      features['sentiment_analysis_results'] = response['sentiment_analysis_results'] if response['sentiment_analysis_results']

      features
    end

    def handle_transcript_error(transcript, error)
      Rails.logger.error "Transcript generation failed for file #{file.id}: #{error.message}"

      transcript.update!(
        status: 'failed',
        error_message: error.message
      )
    end

    def transcript_options
      {
        punctuate: true,
        format_text: true,
        language_detection: true,
        speaker_labels: true,
        dual_channel: false
      }
    end
  end
end
