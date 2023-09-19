# frozen_string_literal: true

module EmailCampaigns
  class EventRegistrationConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign.mailer_class
        .with(campaign: campaign, command: command)
        .campaign_mail
    end

    private

    def campaign
      @campaign ||= EmailCampaigns::Campaigns::EventRegistrationConfirmation.first
    end

    def command
      recipient = activity.item.attendee
      campaign
        .generate_commands(recipient: recipient, activity: activity).first
        .merge(recipient: recipient)
    end

    def activity
      @activity ||= transient_activity
    end

    def existing_activity
      Activity
        .order(created_at: :asc)
        .find_by(item_type: 'Events::Attendance', action: 'created')
    end

    def transient_activity
      event = Event.order(created_at: :asc).first
      attendee = User.order(created_at: :asc).first
      event_attendance = Events::Attendance.new(event: event, attendee: attendee)
      Activity.new(item: event_attendance, action: 'created', user: attendee)
    end
  end
end
