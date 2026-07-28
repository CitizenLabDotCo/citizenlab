# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class ProviderError < Error
      # HTTP 429 — we are being rate limited.
      class RateLimit < ProviderError; end

      # HTTP 5xx — the provider had an internal error.
      class ServerError < ProviderError; end

      # HTTP 503 — the provider is temporarily unavailable.
      class ServiceUnavailable < ProviderError; end

      # The transient provider errors worth retrying.
      RETRYABLE_ERRORS = [RateLimit, ServerError, ServiceUnavailable].freeze
    end
  end
end
