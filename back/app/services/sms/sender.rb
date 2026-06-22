# frozen_string_literal: true

module Sms
  class Sender
    PROVIDERS = {
      twilio: Sms::Providers::Twilio
    }.freeze

    DEFAULT_PROVIDER = :twilio

    def send_now(to:, body:, user_id: nil, campaign_id: nil, provider: DEFAULT_PROVIDER)
      unless AppConfiguration.instance.feature_activated?('sms')
        raise Sms::Error, 'SMS feature is not enabled for this tenant'
      end

      provider_instance = build_provider(provider)

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
        result = provider_instance.send(to: normalized_to, body: body)
        delivery.update!(message_sid: result[:message_sid], status: result[:status])
      rescue Sms::Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      delivery
    end

    private

    def build_provider(key)
      klass = PROVIDERS.fetch(key.to_sym) do
        raise Sms::Error, "Unknown SMS provider: #{key}"
      end
      klass.new
    end
  end
end
