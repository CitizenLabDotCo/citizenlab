# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      EmailCampaigns::CommentOnIdeaYouFollowMailer.preview_command(recipient: recipient_user)
      # TODO: Finish this
    end
  end
end
