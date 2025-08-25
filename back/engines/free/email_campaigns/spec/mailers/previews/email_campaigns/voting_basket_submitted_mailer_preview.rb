# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::VotingBasketSubmitted)
    end
  end
end
