module EmailCampaigns
  class SendCampaignJob < ApplicationJob
    queue_as :default
  
    def perform campaign
      campaign.recipients.each do |recipient|
        CampaignMailer.campaign_mail(campaign, recipient).deliver_later
      end
    end

  end
end
