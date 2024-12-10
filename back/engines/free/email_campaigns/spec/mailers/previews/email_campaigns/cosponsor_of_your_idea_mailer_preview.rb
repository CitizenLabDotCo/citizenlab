# frozen_string_literal: true

module EmailCampaigns
  class CosponsorOfYourIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::CosponsorOfYourIdea.first
      idea = Idea.order(created_at: :asc).first
      user = User.order(created_at: :asc).first
      item = Notifications::CosponsorOfYourIdea.new(post: idea, initiating_user: user)
      activity = Activity.new(item: item, user: user)
      commands = EmailCampaigns::Campaigns::CosponsorOfYourIdea.new.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
