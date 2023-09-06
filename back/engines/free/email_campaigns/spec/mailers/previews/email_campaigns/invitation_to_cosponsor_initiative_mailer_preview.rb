# frozen_string_literal: true

module EmailCampaigns
  class InvitationToCosponsorInitiativeMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::InvitationToCosponsorInitiative.first
      initiative = Initiative.order(created_at: :asc).first
      user = User.order(created_at: :asc).first
      item = Notifications::InvitationToCosponsorInitiative.new(post: initiative)
      activity = Activity.new(item: item)
      commands = EmailCampaigns::Campaigns::InvitationToCosponsorInitiative.new.generate_commands(recipient: user, activity: activity)
      command = commands[0].merge({ recipient: user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
