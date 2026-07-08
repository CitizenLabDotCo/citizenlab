# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendJob < ApplicationJob
      # `to` lets a caller target a number that isn't (yet) the recipient's
      # confirmed `phone` — e.g. the phone-confirmation OTP, sent via perform_now
      # to the pending new_phone. Async sends omit it and fall back to the
      # recipient's confirmed phone.
      def run(delivery_id, to: nil)
        delivery = Delivery.find(delivery_id)
        SendService.new.deliver(delivery, to: to || delivery.user&.phone)
      rescue *ProviderError::RETRYABLE_ERRORS => e
        # A retryable error normally stays 'pending' for a retry. But run
        # synchronously (perform_now, e.g. the OTP) there is no Que worker to
        # retry it — handle_error never runs — so treat it as terminal and mark
        # the delivery failed rather than leaving it stuck 'pending'.
        delivery.update!(status: 'failed', error_message: e.message) if que_target.nil?
        raise
      end

      def handle_error(error)
        case error
        when *ProviderError::RETRYABLE_ERRORS
          # Mark delivery as failed on the final retry to not leave it stuck pending forever.
          mark_delivery_failed(error) if final_attempt?
          super
        else
          # Non-retryable errors already marked the delivery failed in
          # SendService#deliver; just stop the job.
          expire
        end
      end

      private

      def final_attempt?
        error_count >= maximum_retry_count - 1
      end

      def mark_delivery_failed(error)
        Delivery.find_by(id: delivery_id)&.update!(status: 'failed', error_message: error.message)
      end

      def delivery_id
        arguments[0]
      end
    end
  end
end
