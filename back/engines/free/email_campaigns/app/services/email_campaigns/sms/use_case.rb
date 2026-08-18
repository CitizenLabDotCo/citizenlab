# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # This is used to map our own use cases onto the provider's configuration.
    # Typically each use case will have its own messaging service, so that
    # opt-outs are per-use-case.
    module UseCase
      MANUAL_CAMPAIGNS = 'manual_campaigns'
      CONFIRMATION_CODES = 'confirmation_codes'
      ALL = [MANUAL_CAMPAIGNS, CONFIRMATION_CODES].freeze
    end
  end
end
