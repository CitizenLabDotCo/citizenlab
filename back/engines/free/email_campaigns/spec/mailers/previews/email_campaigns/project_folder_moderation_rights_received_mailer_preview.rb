# frozen_string_literal: true

module EmailCampaigns
  class ProjectFolderModerationRightsReceivedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived)
    end
  end
end
