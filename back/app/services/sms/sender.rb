# frozen_string_literal: true

module Sms
  class Sender
    def send_now(to:, body:, user_id: nil, campaign_id: nil)
      unless AppConfiguration.instance.feature_activated?('sms')
        raise Sms::Error, 'SMS feature is not enabled for this tenant'
      end

      parsed_to = Phonelib.parse(to)
      raise Sms::Error, "Invalid phone number: #{to}" unless parsed_to.valid?

      normalized_to = parsed_to.e164

      delivery = Delivery.create!(
        user_id: user_id,
        campaign_id: campaign_id,
        phone_number: normalized_to,
        body: body,
        status: 'pending'
      )

      begin
        result = provider.send(to: normalized_to, body: body)
        delivery.update!(message_sid: result[:message_sid], status: result[:status])
      rescue Sms::Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      delivery
    end

    private

    def provider
      Sms::Providers::Twilio.new
    end
  end
end
