# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::OfficialFeedbackOnIdeaYouFollow)
    end
  end
end
