module EmailCampaigns
  class WelcomeMailerPreview < ActionMailer::Preview
    def campaign_mail
      command = {
        recipient: User.first
      }
      campaign = EmailCampaigns::Campaigns::Welcome.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
