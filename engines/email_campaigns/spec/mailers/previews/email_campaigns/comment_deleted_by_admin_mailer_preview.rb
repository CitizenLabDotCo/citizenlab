module EmailCampaigns
  class CommentDeletedByAdminMailerPreview < ActionMailer::Preview
    def campaign_mail
      comment = Comment.first
      recipient = User.first
      initiating_user = User.last
      command = {
        recipient: recipient,
        event_payload: {
          comment_created_at: comment.created_at&.iso8601,
          comment_body_multiloc: comment.body_multiloc,
          reason_code: 'other',
          other_reason: "I don't tolerate criticism",
          post_type: comment.post_type,
          post_url: Frontend::UrlService.new.model_to_url(comment.post, locale: recipient.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::CommentDeletedByAdmin.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end