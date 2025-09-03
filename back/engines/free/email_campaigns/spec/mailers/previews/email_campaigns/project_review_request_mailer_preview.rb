# frozen_string_literal: true

module EmailCampaigns
  class ProjectReviewRequestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectReviewRequest)
    end
  end
end
