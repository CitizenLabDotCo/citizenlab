# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseStartedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectPhaseStarted)
    end
  end
end
