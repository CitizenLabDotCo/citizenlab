# frozen_string_literal: true

module EmailCampaigns
  class EventUpcomingMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      event = Event.first
      notification = Notifications::EventUpcoming.create!(
        recipient_id: recipient_user.id,
        event: event,
        project: event.project
      )
      activity = Activity.new(item: notification, action: 'created')

      campaign = EmailCampaigns::Campaigns::EventUpcoming.first
      command = campaign.generate_commands(
        activity: activity,
        recipient: recipient_user
      ).first.merge({ recipient: recipient_user })
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
