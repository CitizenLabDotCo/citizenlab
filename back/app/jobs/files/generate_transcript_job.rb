# frozen_string_literal: true

module Files
  # Background job to generate transcripts for audio/video files
  # Uses self-re-enqueuing strategy to avoid blocking workers with long polling
  class GenerateTranscriptJob < ApplicationJob
    queue_as :default

    # Maximum number of status check attempts (30 minutes with increasing delays)
    MAX_ATTEMPTS = 60

    # Base delay between status checks (starts at 10 seconds)
    BASE_DELAY = 10.seconds

    # Maximum delay between status checks (5 minutes)
    MAX_DELAY = 5.minutes

    # Perform transcript generation or status checking
    # @param transcript [Files::Transcript] Transcript record
    # @param attempt [Integer] Current attempt number (for re-enqueued jobs)
    def run(transcript, attempt = 1)
      service = Files::TranscriptService.new(transcript.file)

      case transcript.status
      when 'pending'
        # Submit transcript to AssemblyAI
        Rails.logger.info "Submitting transcript #{transcript.id} to AssemblyAI"
        service.submit_transcript(transcript)

        # Re-enqueue to check status
        self.class.set(wait: BASE_DELAY).perform_later(transcript, attempt + 1)

      when 'processing'
        # Check status with AssemblyAI
        Rails.logger.info "Checking transcript #{transcript.id} status (attempt #{attempt})"
        service.check_transcript_status(transcript)

        # Re-enqueue if still processing and under max attempts
        if transcript.reload.processing? && attempt < MAX_ATTEMPTS
          delay = calculate_delay(attempt)
          Rails.logger.info "Re-enqueuing transcript #{transcript.id} check in #{delay} seconds"
          self.class.set(wait: delay).perform_later(transcript, attempt + 1)
        elsif transcript.processing? && attempt >= MAX_ATTEMPTS
          # Mark as failed if max attempts reached
          Rails.logger.error "Transcript #{transcript.id} timed out after #{MAX_ATTEMPTS} attempts"
          transcript.update!(
            status: 'failed',
            error_message: "Transcription timed out after #{MAX_ATTEMPTS} attempts (#{MAX_ATTEMPTS * BASE_DELAY / 60} minutes)"
          )
        end

      when 'completed', 'failed'
        # Job is complete, nothing more to do
        Rails.logger.info "Transcript #{transcript.id} is #{transcript.status}"

      else
        Rails.logger.error "Unknown transcript status for #{transcript.id}: #{transcript.status}"
      end
    rescue ActiveRecord::RecordNotFound
      Rails.logger.error "Transcript #{transcript.id} not found"
    rescue StandardError => e
      Rails.logger.error "Error processing transcript #{transcript.id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Try to mark transcript as failed if we can find it
      begin
        transcript = Files::Transcript.find(transcript.id)
        transcript.update!(
          status: 'failed',
          error_message: "Job failed: #{e.message}"
        )
      rescue ActiveRecord::RecordNotFound
        # Transcript was deleted, nothing we can do
      end

      # Re-raise to trigger job retry mechanism
      raise
    end

    private

    # Calculate delay with exponential backoff
    # Starts at BASE_DELAY, increases gradually, caps at MAX_DELAY
    # @param attempt [Integer] Current attempt number
    # @return [ActiveSupport::Duration] Delay duration
    def calculate_delay(attempt)
      # Exponential backoff: 10s, 15s, 22s, 33s, 50s, 75s, then cap at 5 minutes
      delay_seconds = BASE_DELAY * (1.5**(attempt - 2))
      [delay_seconds.seconds, MAX_DELAY].min
    end
  end
end
