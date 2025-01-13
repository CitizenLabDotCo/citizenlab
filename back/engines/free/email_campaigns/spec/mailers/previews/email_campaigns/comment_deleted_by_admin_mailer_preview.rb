# frozen_string_literal: true

module EmailCampaigns
  class CommentDeletedByAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      comment = Comment.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          comment_created_at: comment.created_at&.iso8601,
          comment_body_multiloc: comment.body_multiloc,
          reason_code: 'other',
          other_reason: "I don't tolerate criticism",
          idea_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient_user.locale))
        }
      }
      campaign = EmailCampaigns::Campaigns::CommentDeletedByAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
