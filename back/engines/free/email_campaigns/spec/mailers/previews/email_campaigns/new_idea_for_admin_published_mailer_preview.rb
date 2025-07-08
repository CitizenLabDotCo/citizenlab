# frozen_string_literal: true

module EmailCampaigns
  class NewIdeaForAdminPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::NewIdeaForAdminPublished)
    end
  end
end
