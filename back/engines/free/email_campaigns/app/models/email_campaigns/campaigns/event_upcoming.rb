# frozen_string_literal: true

module EmailCampaigns
  class Campaigns::EventUpcoming < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      EventUpcomingMailer
    end

    def activity_triggers
      { 'Notifications::EventUpcoming' => { 'created' => true } }
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.attendees'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.events'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.24_hours_before_event_starts'
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      [{
        event_payload: {
          event_id: notification.event_id,
          event_title_multiloc: notification.event.title_multiloc,
          event_description_multiloc: notification.event.description_multiloc,
          event_start_at: notification.event.start_at.iso8601,
          event_end_at: notification.event.end_at.iso8601,
          event_location_multiloc: notification.event.location_multiloc,
          event_online_link: notification.event.online_link,
          event_url: Frontend::UrlService.new.model_to_url(notification.event, locale: recipient.locale),
          project_title_multiloc: notification.project.title_multiloc,
          project_image_url: notification.project.header_bg.url
        }
      }]
    end
  end
end
