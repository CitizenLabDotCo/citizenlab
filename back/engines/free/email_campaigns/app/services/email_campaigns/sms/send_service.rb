# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendService
      def create_delivery(body:, user_id: nil, campaign_id: nil)
        unless AppConfiguration.instance.feature_activated?('sms')
          raise Error, 'SMS feature is not enabled for this tenant'
        end

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

        parsed_to = parse_phone_number(to)
        result = provider.send(to: parsed_to, body: delivery.body)
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

      def parse_phone_number(to)
        # Phonelib::Phone — libphonenumber's reading of the string (country, line type, formats).
        # `valid?` has to gate `e164`: with no default_country configured, a number lacking an
        # international prefix resolves to no country yet still yields a malformed "+0470123456".
        parsed = Phonelib.parse(to)
        raise Error, "Invalid phone number: #{to}" unless parsed.valid?

        parsed.e164
      end

      def provider
        Providers::Twilio.new
      end
    end
  end
end
