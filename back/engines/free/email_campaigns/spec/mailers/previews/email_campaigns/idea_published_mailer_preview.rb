# frozen_string_literal: true

module EmailCampaigns
  class IdeaPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::IdeaPublished)
    end
  end
end
