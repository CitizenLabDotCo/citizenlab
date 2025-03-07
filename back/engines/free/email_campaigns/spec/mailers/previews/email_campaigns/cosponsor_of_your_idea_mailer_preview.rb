# frozen_string_literal: true

module EmailCampaigns
  class CosponsorOfYourIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::CosponsorOfYourIdea.first
      idea = Idea.order(created_at: :asc).first
      initiating_user = User.order(created_at: :asc).first
      item = Notifications::CosponsorOfYourIdea.new(idea: idea, initiating_user: initiating_user)
      activity = Activity.new(item: item, user: recipient_user)
      commands = campaign.generate_commands(recipient: recipient_user, activity: activity)
      command = commands[0].merge({ recipient: recipient_user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
