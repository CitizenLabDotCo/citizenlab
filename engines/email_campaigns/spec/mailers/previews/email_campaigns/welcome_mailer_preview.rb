module EmailCampaigns
  class WelcomeMailerPreview < ActionMailer::Preview
    def campaign_mail
      command = {
        recipient: User.first
      }
      campaign = EmailCampaigns::Campaigns::Welcome.first

      campaign.mailer_class.campaign_mail campaign, command
    end
  end
end