# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      # TODO: Have to change these classes so that they do not persist any new data
      # TODO: Feels like we should move this to the app too instead of the spec folder
      comment = Comment.first || Comment.create(idea: Idea.where(creation_phase: nil).first, author: User.first, body_multiloc: { 'en' => 'I agree' })
      notification = Notifications::CommentOnIdeaYouFollow.new(
        recipient_id: recipient_user.id,
        initiating_user: comment.author,
        idea: comment.idea,
        comment: comment,
        project_id: comment.idea.project_id
      )
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
