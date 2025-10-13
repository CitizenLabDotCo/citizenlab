# frozen_string_literal: true

module EmailCampaigns
  class ProjectReviewStateChangeMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectReviewStateChange)
    end
  end
end
