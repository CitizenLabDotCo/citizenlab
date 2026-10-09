# frozen_string_literal: true

module AIAssistant
  # Runs one assistant turn in the background; the frontend polls the conversation.
  class TurnJob < ApplicationJob
    self.priority = 45

    # Someone is waiting for the reply, so don't retry for hours like other jobs do.
    MAX_RETRY_COUNT = 2

    RETRYABLE_ERRORS = [
      RubyLLM::RateLimitError,
      RubyLLM::OverloadedError,
      RubyLLM::ServerError,
      RubyLLM::ServiceUnavailableError
    ].freeze

    def run(conversation)
      return unless conversation.running?

      Runner.new(conversation).run
    end

    def handle_error(error)
      retryable?(error) && error_count <= MAX_RETRY_COUNT ? super : expire
    end

    private

    def expire
      conversation.update!(status: 'failed', last_error_code: error_code(que_target.que_error))
      super
    end

    def conversation
      arguments.first
    end

    def retryable?(error)
      RETRYABLE_ERRORS.any? { |error_class| error.is_a?(error_class) }
    end

    def error_code(error)
      case error
      when *RETRYABLE_ERRORS then 'llm_unavailable'
      when RubyLLM::ContextLengthExceededError then 'context_too_long'
      when RubyLLM::BadRequestError then 'llm_request_rejected'
      else 'unexpected_error'
      end
    end
  end
end
