# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendService
      def send_now(to:, body:, user_id: nil, campaign_id: nil)
        # Validate/normalize up front so an invalid number raises before a
        # delivery row is created.
        parsed_to = parse_phone_number(to)
        delivery = create_delivery(body: body, user_id: user_id, campaign_id: campaign_id)
        deliver(delivery, to: parsed_to)
      end

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
        parsed_to = parse_phone_number(to)
        validate_delivery_status(delivery)
        result = provider.send(to: parsed_to, body: delivery.body)
        delivery.update!(message_sid: result[:message_sid], status: result[:status])
        delivery
      rescue Error::RateLimit
        # Leave the delivery pending so Sms::SendJob can retry it;
        raise
      rescue Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      private

      def parse_phone_number(to)
        parsed = Phonelib.parse(to)
        raise Error, "Invalid phone number: #{to}" unless parsed.valid?

        parsed.e164
      end

      # Validates that the delivery is in a state that can be sent
      def validate_delivery_status(delivery)
        raise Error, 'Delivery is not pending' unless delivery.status == 'pending'
      end

      def provider
        Providers::Twilio.new
      end
    end
  end
end
