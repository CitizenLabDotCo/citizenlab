# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::CommentOnIdeaYouFollow)
    end
  end
end
