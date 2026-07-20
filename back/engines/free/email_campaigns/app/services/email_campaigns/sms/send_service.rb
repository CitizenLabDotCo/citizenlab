# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendService
      # `to` is the number the delivery is meant for. It's validated here, before
      # the record exists: a Delivery should only be created for a message we're
      # actually able to send.
      def create_delivery(body:, to:, user_id: nil, campaign_id: nil)
        unless AppConfiguration.instance.feature_activated?('sms')
          raise Error, 'SMS feature is not enabled for this tenant'
        end

        ensure_sendable!(to)

        Delivery.create!(
          user_id: user_id,
          campaign_id: campaign_id,
          body: body,
          status: 'pending'
        )
      end

      # Sends an already-created pending delivery through the provider.
      def deliver(delivery, to:)
        # An at-least-once job re-run can hand us a delivery that already left
        # `pending` (e.g. already sent/delivered). Treat that as a no-op so we
        # neither re-send it nor let the failure rescue below overwrite its real
        # status with `failed`.
        return delivery unless delivery.status == 'pending'

        # Re-checked here, not just at creation time: an async delivery resolves its
        # destination from the recipient's phone when the job runs, which may have
        # changed since.
        parsed = ensure_sendable!(to)
        result = provider.send(to: parsed.e164, body: delivery.body)
        delivery.update!(message_sid: result[:message_sid], status: result[:status])
        delivery
      rescue *ProviderError::RETRYABLE_ERRORS
        # Transient failure — leave the delivery pending so Sms::SendJob can retry it.
        raise
      rescue Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      private

      # Raises unless `to` is a valid number in a country this platform allows SMS
      # to. Returns the parsed number, so callers can use its E.164 form.
      def ensure_sendable!(to)
        parsed = Phonelib.parse(to)
        raise Error, "Invalid phone number: #{to}" unless parsed.valid?

        unless AllowedCountries.allowed?(parsed.country)
          raise Error, "SMS to country #{parsed.country} is not allowed on this platform"
        end

        parsed
      end

      def provider
        fake_sms_sends? ? Providers::Fake.new : Providers::Twilio.new
      end

      # In development, skip the real Twilio API unless the tenant has credentials filled in.
      def fake_sms_sends?
        return false unless Rails.env.development?

        config = AppConfiguration.instance.settings('sms') || {}
        config.values_at('twilio_account_sid', 'twilio_auth_token', 'twilio_messaging_service_sid').any?(&:blank?)
      end
    end
  end
end
