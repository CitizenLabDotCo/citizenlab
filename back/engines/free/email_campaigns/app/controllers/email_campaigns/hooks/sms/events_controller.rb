# frozen_string_literal: true

module EmailCampaigns
  class Hooks::Sms::EventsController < EmailCampaignsController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def create
      return head :forbidden unless provider.verify_signature(request)

      parsed = provider.parse_callback(params)

      # A callback with no message SID can't be matched to a delivery — and
      # find_by(message_sid: nil) would match an arbitrary un-sent (still-NULL) row.
      return head :bad_request if parsed[:message_sid].blank?

      delivery = EmailCampaigns::Sms::Delivery.find_by(message_sid: parsed[:message_sid])
      return head :not_found if delivery.nil?

      if parsed[:opted_out]
        EmailCampaigns::Sms::UseCaseConsentService.new.withdraw!(delivery.user, delivery.campaign_use_case)
      end

      # If an unknown status is returned we log it for investigation but still
      # return 200 so the provider stops retrying.
      if parsed[:status].nil?
        ErrorReporter.report_msg(
          'SMS callback: received an unmapped provider status',
          extra: { delivery_id: delivery.id, raw_status: parsed[:raw_status] }
        )
        return head :ok
      end

      # advance_status! is a no-op when the callback arrives out of order; we
      # still return 200 so the provider stops retrying.
      advanced = delivery.advance_status!(parsed[:status])

      # A delivery can only reach a terminal status once, so a stray later callback
      # (which no longer advances it) can't queue a second fetch for the same message.
      if advanced && delivery.awaiting_segments_count?
        EmailCampaigns::Sms::FetchSegmentsJob.perform_later(delivery.id)
      end

      head :ok
    end

    private

    # The single configured SMS provider. Swap here if another is ever added.
    def provider
      @provider ||= EmailCampaigns::Sms::Providers::Twilio.new
    end
  end
end
