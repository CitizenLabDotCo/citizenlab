module EmailCampaigns
  class Campaigns::ProjectPhaseUpcoming < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      ProjectPhaseUpcomingMailer
    end

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def activity_triggers
      {'Notifications::ProjectPhaseUpcoming' => {'created' => true}}
    end

    def self.category
      'admin'
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          phase_title_multiloc: notification.phase.title_multiloc,
          phase_description_multiloc: notification.phase.description_multiloc,
          phase_start_at: notification.phase.start_at.iso8601,
          phase_end_at: notification.phase.end_at.iso8601,
          phase_url: Frontend::UrlService.new.model_to_url(notification.phase, locale: recipient.locale),
          project_title_multiloc: notification.project.title_multiloc,
          project_description_multiloc: notification.project.description_multiloc
        },
        delay: 8.hours.to_i
      }]
    end
  end
end
