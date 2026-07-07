# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Base error for the SMS module, raised for our own validation/config failures.
    # Failures from the external provider are raised as Sms::ProviderError (and its
    # retryable subclasses) instead.
    class Error < StandardError; end
  end
end
