# frozen_string_literal: true

module WebApi
  module V1
    module Sms
      class CallbacksController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized
        skip_after_action :verify_policy_scoped

        def twilio
          process_callback(::Sms::Providers::Twilio.new)
        end

        private

        def process_callback(provider)
          return head :forbidden unless provider.verify_signature(request)

          parsed = provider.parse_callback(params)
          delivery = SmsDelivery.find_by(message_sid: parsed[:message_sid])

          return head :not_found if delivery.nil?
          return head :unprocessable_entity if parsed[:status].nil?

          # advance_status! is a no-op when the callback arrives out of order; we
          # still return 200 so the provider stops retrying.
          delivery.advance_status!(parsed[:status])
          head :ok
        end
      end
    end
  end
end
