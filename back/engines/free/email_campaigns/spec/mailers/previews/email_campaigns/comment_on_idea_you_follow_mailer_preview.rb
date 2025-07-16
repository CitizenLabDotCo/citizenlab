# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.new
      command = campaign.mailer_class.preview_command(recipient: recipient_user)
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
