# frozen_string_literal: true

require 'faraday'
require 'json'

# Client wrapper for AssemblyAI API
# Handles transcript submission and retrieval
class AssemblyAIClient
  class Error < StandardError; end
  class ApiError < Error; end
  class AuthenticationError < Error; end
  class RateLimitError < Error; end
  class TranscriptNotFoundError < Error; end

  API_BASE_URL = 'https://api.assemblyai.com/v2'

  def initialize(api_key: nil)
    @api_key = api_key || ENV.fetch('ASSEMBLYAI_API_KEY', nil)
    raise ArgumentError, 'AssemblyAI API key is required' if @api_key.blank?
  end

  # Submit a file for transcription
  # @param audio_url [String] URL of the audio/video file to transcribe
  # @param options [Hash] Optional transcription parameters
  # @return [Hash] Response containing transcript ID and status
  def submit_transcript(audio_url, options = {})
    payload = {
      audio_url: audio_url,
      **default_options.merge(options)
    }

    response = post('/transcript', payload)
    handle_response(response)
  end

  # Get transcript status and results
  # @param transcript_id [String] AssemblyAI transcript ID
  # @return [Hash] Transcript data including status and results
  def get_transcript(transcript_id)
    response = get("/transcript/#{transcript_id}")
    handle_response(response)
  end

  # Check if transcript is completed
  # @param transcript_id [String] AssemblyAI transcript ID
  # @return [Boolean] True if transcript is completed
  def transcript_completed?(transcript_id)
    transcript_data = get_transcript(transcript_id)
    transcript_data['status'] == 'completed'
  rescue TranscriptNotFoundError
    false
  end

  # Health check for AssemblyAI service
  # @return [Boolean] True if service is accessible
  def healthy?
    response = get('/transcript/list?limit=1')
    response.status == 200
  rescue StandardError
    false
  end

  private

  attr_reader :api_key

  def connection
    @connection ||= Faraday.new(url: API_BASE_URL) do |conn|
      conn.request :json
      conn.response :json
      conn.headers['Authorization'] = api_key
      conn.headers['Content-Type'] = 'application/json'
      conn.adapter Faraday.default_adapter
    end
  end

  def get(path)
    connection.get(path)
  rescue Faraday::Error => e
    raise ApiError, "Request failed: #{e.message}"
  end

  def post(path, payload)
    connection.post(path, payload)
  rescue Faraday::Error => e
    raise ApiError, "Request failed: #{e.message}"
  end

  def handle_response(response)
    case response.status
    when 200, 201
      response.body
    when 401
      raise AuthenticationError, 'Invalid API key'
    when 404
      raise TranscriptNotFoundError, 'Transcript not found'
    when 429
      raise RateLimitError, 'Rate limit exceeded'
    when 400..499
      error_message = response.body&.dig('error') || 'Client error'
      raise ApiError, "API error (#{response.status}): #{error_message}"
    when 500..599
      raise ApiError, "Server error (#{response.status})"
    else
      raise ApiError, "Unexpected response status: #{response.status}"
    end
  end

  def default_options
    {
      punctuate: true,
      format_text: true,
      language_detection: true,
      speaker_labels: true
    }
  end
end
