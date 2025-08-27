# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::VotingBasketNotSubmitted)
    end
  end
end
