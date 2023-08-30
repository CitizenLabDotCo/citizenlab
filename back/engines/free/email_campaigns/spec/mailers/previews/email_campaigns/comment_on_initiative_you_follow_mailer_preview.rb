# frozen_string_literal: true

module EmailCampaigns
  class CommentOnInitiativeYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      comment = Comment.where(post_type: 'Initiative').first || Comment.create(post: Initiative.first, author: User.first, body_multiloc: { 'en' => 'I agree' })
      notification = Notifications::CommentOnInitiativeYouFollow.create!(
        recipient_id: recipient_user.id,
        initiating_user: comment.author,
        post: comment.post,
        comment: comment
      )
      activity = Activity.new(item: notification, action: 'created')

      campaign = EmailCampaigns::Campaigns::CommentOnInitiativeYouFollow.first
      command = campaign.generate_commands(
        activity: activity,
        recipient: recipient_user
      ).first.merge({ recipient: recipient_user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
