# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      comment = Comment.where(post_type: 'Idea').first || Comment.create(post: Idea.where(creation_phase: nil).first, author: User.first, body_multiloc: { 'en' => 'I agree' })
      notification = Notifications::CommentOnIdeaYouFollow.create!(
        recipient_id: recipient_user.id,
        initiating_user: comment.author,
        post: comment.post,
        comment: comment,
        project_id: comment.post.project_id
      )
      comment.post.phases.first.update!(input_term: 'question') if comment.post.phases.any?
      activity = Activity.new(item: notification, action: 'created')

      campaign = EmailCampaigns::Campaigns::CommentOnIdeaYouFollow.first
      command = campaign.generate_commands(
        activity: activity,
        recipient: recipient_user
      ).first.merge({ recipient: recipient_user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
