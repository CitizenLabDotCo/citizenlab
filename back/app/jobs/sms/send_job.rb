# frozen_string_literal: true

module Sms
  class SendJob < ApplicationJob
    def run(to:, body:, user_id: nil)
      normalized_to = Sms::PhoneNormalizer.normalize(to)
      raise Sms::Error, "Invalid phone number: #{to}" unless Sms::PhoneNormalizer.valid?(normalized_to)

      delivery = SmsDelivery.create!(
        user_id: user_id,
        phone_number: normalized_to,
        body: body,
        status: 'queued'
      )

      begin
        result = Sms::TwilioProvider.new.send(to: normalized_to, body: body)
        delivery.update!(message_sid: result[:message_sid], status: 'sent')
      rescue Sms::Error => e
        delivery.update!(status: 'failed', error_message: e.message)
        raise
      end

      delivery
    end
  end
end
