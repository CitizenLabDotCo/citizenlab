# frozen_string_literal: true

module EmailCampaigns
  class InitiativeResubmittedForReviewMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::InitiativeResubmittedForReview.first
      initiative = Initiative.order(created_at: :asc).first
      user = User.order(created_at: :asc).first
      item = Notifications::InitiativeResubmittedForReview.new(post: initiative)
      activity = Activity.new(item: item)
      commands = EmailCampaigns::Campaigns::InitiativeResubmittedForReview.new.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
