# frozen_string_literal: true

module EmailCampaigns
  module Sms
    module Providers
      # A no-op provider used in development when no real Twilio credentials are
      # configured. It never hits an external API: it logs the
      # message body — No delivery callback ever arrives (nothing was sent),
      # so the delivery stays at the returned status.
      class Fake < Base
        def send(to:, body:)
          Rails.logger.info("[SMS::Fake] Pretending to send SMS to #{to}: #{body}")
          { message_sid: "FAKE_#{SecureRandom.hex(8)}", status: 'sent' }
        end
      end
    end
  end
end
