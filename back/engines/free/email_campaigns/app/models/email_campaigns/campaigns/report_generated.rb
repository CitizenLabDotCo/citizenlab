# frozen_string_literal: true

module EmailCampaigns
  # Tells the admin who asked for an LLM-written report that it is ready.
  #
  # Composing takes minutes and runs in the background, so the admin is told to walk
  # away. This mail is how they come back to it.
  class Campaigns::ReportGenerated < Campaign
    include Consentable
    include Disableable
    include ActivityTriggerable
    include RecipientConfigurable
    include Trackable
    include ContentConfigurable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      ReportGeneratedMailer
    end

    def activity_triggers
      { 'Notifications::ReportGenerated' => { 'created' => true } }
    end

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admin_who_generated_the_report'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.report_generated'
    end

    def generate_commands(recipient:, activity:)
      notification = activity.item
      [{
        event_payload: {
          project_title_multiloc: notification.project&.title_multiloc,
          report_url: report_url(notification.report_id, recipient)
        }
      }]
    end

    private

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient_id)
    end

    def report_url(report_id, recipient)
      home = Frontend::UrlService.new.home_url(locale: Locale.new(recipient.locale))
      "#{home}/admin/reporting/report-builder/#{report_id}/editor"
    end
  end
end
