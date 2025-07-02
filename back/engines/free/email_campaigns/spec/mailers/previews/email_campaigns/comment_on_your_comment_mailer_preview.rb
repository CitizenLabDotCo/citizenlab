# frozen_string_literal: true

module EmailCampaigns
  class CommentOnYourCommentMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::CommentOnYourComment)
    end
  end
end
