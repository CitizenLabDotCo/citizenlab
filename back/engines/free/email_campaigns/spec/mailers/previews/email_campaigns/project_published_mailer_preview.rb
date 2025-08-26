# frozen_string_literal: true

module EmailCampaigns
  class ProjectPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectPublished)
    end
  end
end
