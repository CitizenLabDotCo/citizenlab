module Texting
  class SendCampaignJob < ApplicationJob
    perform_retries false

    def run(campaign)
      provider = Texting::Sms.provider
      sent_statuses = campaign.phone_numbers.map.with_index do |number, index|
        callback = status_callback(campaign) if index + 1 == campaign.phone_numbers.length
        provider.send_msg(campaign.message, number, status_callback: callback)
      end

      campaign.update!(status: Texting::Campaign.statuses.fetch(:failed)) if sent_statuses.none?
    end

    private

    def status_callback(campaign)
      Texting::Engine.routes.url_helpers.mark_as_sent_web_api_v1_campaign_url(
        campaign.id, host: Tenant.current.host, protocol: :https
      )
    end
  end
end
