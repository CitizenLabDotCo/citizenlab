# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class Error < StandardError
      # Raised when the provider rejects a message because we are being rate
      # limited. Unlike other errors this is transient, so Sms::SendJob retries it.
      class RateLimit < Error; end
    end
  end
end
