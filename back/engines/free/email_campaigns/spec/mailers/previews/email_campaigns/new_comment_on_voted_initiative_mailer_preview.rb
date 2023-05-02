# frozen_string_literal: true

module EmailCampaigns
  class NewCommentOnVotedInitiativeMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::NewCommentOnVotedInitiative.first
      comment = Comment.find_by(post_type: 'Initiative')
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient_user)

      command = {
        recipient: recipient_user,
        event_payload: {
          initiating_user_first_name: comment.author&.first_name,
          initiating_user_last_name: name_service.last_name!(comment.author),
          post_published_at: comment.post.published_at.iso8601,
          post_title_multiloc: comment.post.title_multiloc,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient_user.locale)
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
