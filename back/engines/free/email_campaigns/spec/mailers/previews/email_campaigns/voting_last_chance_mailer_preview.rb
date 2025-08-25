# frozen_string_literal: true

module EmailCampaigns
  class VotingLastChanceMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::VotingLastChance)
    end
  end
end
