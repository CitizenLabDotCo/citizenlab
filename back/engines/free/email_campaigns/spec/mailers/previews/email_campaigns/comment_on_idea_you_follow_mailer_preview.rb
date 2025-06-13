# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      EmailCampaigns::CommentOnIdeaYouFollowMailer.preview_email(
        campaign: Campaigns::CommentOnIdeaYouFollow.first,
        recipient: recipient_user
      )
    end
  end
end
