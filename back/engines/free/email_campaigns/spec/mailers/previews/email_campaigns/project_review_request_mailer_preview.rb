# frozen_string_literal: true

require_relative 'preview_mailer'

module EmailCampaigns
  class ProjectReviewRequestMailerPreview < ::PreviewMailer
    def campaign_mail
      campaign.mailer_class
        .with(campaign: campaign, command: command)
        .campaign_mail
    end

    private

    def campaign
      @campaign ||= EmailCampaigns::Campaigns::ProjectReviewRequest.first
    end

    def command
      recipient = activity.item.recipient
      campaign
        .generate_commands(recipient: recipient, activity: activity).first
        .merge(recipient: recipient)
    end

    def activity
      @activity ||= transient_activity
    end

    def transient_activity
      project_review = FactoryBot.create(:project_review)

      notification = Notifications::ProjectReviewRequest.new(
        project_review: project_review,
        recipient: project_review.reviewer,
        initiating_user: project_review.requester
      )

      Activity.create(item: notification, action: 'created', user: notification.recipient)
    end
  end
end
