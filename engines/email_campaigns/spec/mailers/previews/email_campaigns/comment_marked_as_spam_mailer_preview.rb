module EmailCampaigns
  class CommentMarkedAsSpamMailerPreview < ActionMailer::Preview
    def campaign_mail
      comment = Comment.first
      recipient = User.first
      initiating_user = User.last
      command = {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_title_multiloc: comment.post.title_multiloc,
          post_type: comment.post_type,
          comment_author_name: comment.author_name,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale),
          spam_report_reason_code: 'inappropriate',
          spam_report_other_reason: nil
        }
      }
      campaign = EmailCampaigns::Campaigns::CommentMarkedAsSpam.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end