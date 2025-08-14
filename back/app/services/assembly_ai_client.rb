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

  def initialize(api_key: nil, region: nil)
    @api_key = api_key || ENV.fetch('ASSEMBLYAI_API_KEY', nil)
    @region = region || ENV.fetch('ASSEMBLYAI_REGION', 'eu')
    raise ArgumentError, 'AssemblyAI API key is required' if @api_key.blank?
  end

  # Submit a file for transcription
  # @param audio_url [String] URL of the audio/video file to transcribe
  # @param options [Hash] Optional transcription parameters
  # @return [Hash] Response containing transcript ID and status
  def submit_transcript_from_url(audio_url, options = {})
    payload = {
      audio_url: audio_url,
      **default_options.merge(options)
    }

    response = post('/v2/transcript', payload)
    handle_response(response)
  end

  def submit_transcript_from_file(file_io, options = {})
    url = upload_file(file_io)
    submit_transcript_from_url(url, options)
  end

  # Get transcript status and results
  # @param transcript_id [String] AssemblyAI transcript ID
  # @return [Hash] Transcript data including status and results
  def get_transcript(transcript_id)
    response = get("/v2/transcript/#{transcript_id}")
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

  private

  attr_reader :api_key, :region

  def api_base_url
    case region
    when 'us'
      'https://api.assemblyai.com'
    when 'eu'
      'https://api.eu.assemblyai.com'
    else
      raise ArgumentError, "Unsupported region: #{region}"
    end
  end

  def upload_file(file_io)
    conn = Faraday.new(url: api_base_url) do |faraday|
      faraday.response :json
      faraday.request :multipart
      faraday.headers['Authorization'] = api_key
      faraday.headers['Content-Type'] = 'application/octet-stream'
    end
    response = conn.post('/v2/upload') do |req|
      req.body = file_io.read
    end
    body = handle_response(response)
    body['upload_url']
  end

  def connection
    @connection ||= Faraday.new(url: api_base_url) do |faraday|
      faraday.request :json
      faraday.response :json
      faraday.headers['Authorization'] = api_key
      faraday.headers['Content-Type'] = 'application/json'
      faraday.adapter Faraday.default_adapter
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
