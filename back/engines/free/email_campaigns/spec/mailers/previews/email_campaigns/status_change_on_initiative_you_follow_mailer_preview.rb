# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnInitiativeYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::StatusChangeOnInitiativeYouFollow.first

      command = campaign.generate_commands(
        recipient: recipient_user,
        activity: Activity.new(item: Notification.new(post: Initiative.first))
      ).first.merge({ recipient: recipient_user })

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
