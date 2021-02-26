module EmailCampaigns
  module MailerHelper
    def email
      described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now
    end
  end
end
