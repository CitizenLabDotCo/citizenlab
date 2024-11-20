# frozen_string_literal: true

module EmailCampaigns
  class InvitationToCosponsorIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::InvitationToCosponsorIdea.first
      proposal = Idea.order(created_at: :asc).first
      user = User.order(created_at: :asc).first
      item = Notifications::InvitationToCosponsorIdea.new(post: proposal)
      activity = Activity.new(item: item)
      commands = EmailCampaigns::Campaigns::InvitationToCosponsorIdea.new.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
