# frozen_string_literal: true

module Texting
  class SendCampaignJob < ApplicationJob
    perform_retries false

    def run(campaign)
      provider = Texting::Sms.provider
      sent_statuses = campaign.phone_numbers.map.with_index do |number, index|
        if index + 1 == campaign.phone_numbers.length
          callback = Texting::WebhookUrlGenerator.new.mark_campaign_as_sent(campaign)
        end
        provider.send_msg(campaign.message, number, status_callback: callback)
      end

      campaign.update!(status: Texting::Campaign.statuses.fetch(:failed)) if sent_statuses.none?
    end
  end
end
