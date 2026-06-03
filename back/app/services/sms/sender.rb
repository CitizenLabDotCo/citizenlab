# frozen_string_literal: true

module Sms
  class Sender
    PROVIDERS = {
      twilio: Sms::Providers::Twilio,
      aws: Sms::Providers::Aws
    }.freeze

    DEFAULT_PROVIDER = :twilio

    def send(to:, body:, user_id: nil, provider: DEFAULT_PROVIDER)
      provider_instance = build_provider(provider)

      normalized_to = Sms::PhoneNormalizer.normalize(to)
      raise Sms::Error, "Invalid phone number: #{to}" unless Sms::PhoneNormalizer.valid?(normalized_to)

      delivery = Delivery.create!(
        user_id: user_id,
        phone_number: normalized_to,
        body: body,
        status: 'queued'
      )

      begin
        result = provider_instance.send(to: normalized_to, body: body)
        delivery.update!(message_sid: result[:message_sid], status: 'sent')
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
