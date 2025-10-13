# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::StatusChangeOnIdeaYouFollow)
    end
  end
end
