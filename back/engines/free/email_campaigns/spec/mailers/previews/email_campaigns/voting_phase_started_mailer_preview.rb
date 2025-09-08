# frozen_string_literal: true

module EmailCampaigns
  class VotingPhaseStartedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::VotingPhaseStarted)
    end
  end
end
