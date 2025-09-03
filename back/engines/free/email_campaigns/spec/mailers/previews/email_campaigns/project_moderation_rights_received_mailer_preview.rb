# frozen_string_literal: true

module EmailCampaigns
  class ProjectModerationRightsReceivedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectModerationRightsReceived)
    end
  end
end
