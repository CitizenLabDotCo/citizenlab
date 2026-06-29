# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::Sms::CallbacksController < EmailCampaignsController
    skip_before_action :authenticate_user
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def create
      return head :forbidden unless provider.verify_signature(request)

      parsed = provider.parse_callback(params)
      delivery = EmailCampaigns::Sms::Delivery.find_by(message_sid: parsed[:message_sid])

      return head :not_found if delivery.nil?
      return head :unprocessable_entity if parsed[:status].nil?

      # advance_status! is a no-op when the callback arrives out of order; we
      # still return 200 so the provider stops retrying.
      delivery.advance_status!(parsed[:status])
      head :ok
    end

    private

    # The single configured SMS provider. Swap here if another is ever added.
    def provider
      @provider ||= EmailCampaigns::Sms::Providers::Twilio.new
    end
  end
end
