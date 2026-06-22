# frozen_string_literal: true

module Sms
  class Sender
    PROVIDERS = {
      twilio: Sms::Providers::Twilio
    }.freeze

    DEFAULT_PROVIDER = :twilio

    # Creates the delivery and sends it in one go (used for ad-hoc sends).
    def send_now(to:, body:, user_id: nil, campaign_id: nil, provider: DEFAULT_PROVIDER)
      provider_instance = build_provider(provider)
      delivery = create_delivery(to: to, body: body, user_id: user_id, campaign_id: campaign_id)
      dispatch(delivery, provider_instance)
    end

    # Records a pending delivery synchronously, validating the feature flag and
    # phone number. Lets a caller persist the delivery (e.g. for a campaign's
    # sent? guard) before the actual send happens asynchronously via #deliver.
    def create_delivery(to:, body:, user_id: nil, campaign_id: nil)
      unless AppConfiguration.instance.feature_activated?('sms')
        raise Sms::Error, 'SMS feature is not enabled for this tenant'
      end

      parsed_to = Phonelib.parse(to)
      raise Sms::Error, "Invalid phone number: #{to}" unless parsed_to.valid?

      Delivery.create!(
        user_id: user_id,
        campaign_id: campaign_id,
        phone_number: parsed_to.e164,
        body: body,
        status: 'pending'
      )
    end

    # Sends an already-created pending delivery through the provider.
    def deliver(delivery, provider: DEFAULT_PROVIDER)
      dispatch(delivery, build_provider(provider))
    end

    private

    def dispatch(delivery, provider_instance)
      result = provider_instance.send(to: delivery.phone_number, body: delivery.body)
      delivery.update!(message_sid: result[:message_sid], status: result[:status])
      delivery
    rescue Sms::Error => e
      delivery.update!(status: 'failed', error_message: e.message)
      raise
    end

    def build_provider(key)
      klass = PROVIDERS.fetch(key.to_sym) do
        raise Sms::Error, "Unknown SMS provider: #{key}"
      end
      klass.new
    end
  end
end
