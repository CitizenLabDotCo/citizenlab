# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendService
      def send_now(to:, body:, user_id: nil, campaign_id: nil)
        delivery = create_delivery(to: to, body: body, user_id: user_id, campaign_id: campaign_id)
        deliver(delivery)
      end

      def create_delivery(to:, body:, user_id: nil, campaign_id: nil)
        unless AppConfiguration.instance.feature_activated?('sms')
          raise Error, 'SMS feature is not enabled for this tenant'
        end

        parsed_to = Phonelib.parse(to)
        raise Error, "Invalid phone number: #{to}" unless parsed_to.valid?

        Delivery.create!(
          user_id: user_id,
          campaign_id: campaign_id,
          body: body,
          status: 'pending'
        )
      end

      # Sends an already-created pending delivery through the provider.
      def deliver(delivery)
        result = provider.send(to: delivery.phone_number, body: delivery.body)
        delivery.update!(message_sid: result[:message_sid], status: result[:status])
        delivery
      rescue Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      private

      def provider
        Providers::Twilio.new
      end
    end
  end
end
