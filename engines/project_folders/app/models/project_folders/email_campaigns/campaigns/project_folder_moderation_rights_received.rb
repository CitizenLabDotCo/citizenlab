module ProjectFolders
  module EmailCampaigns
    class Campaigns::ProjectFolderModerationRightsReceived < ::EmailCampaigns::Campaign
      include ::EmailCampaigns::ActivityTriggerable
      include ::EmailCampaigns::RecipientConfigurable
      include ::EmailCampaigns::Disableable
      include ::EmailCampaigns::Trackable
      include ::EmailCampaigns::LifecycleStageRestrictable

      allow_lifecycle_stages only: %w[trial active]

      recipient_filter :filter_notification_recipient

      delegate :model_to_url, to: :url_service

      def mailer_class
        ProjectFolderModerationRightsReceivedMailer
      end

      def activity_triggers
        { 'ProjectFolders::Notifications::ProjectFolderModerationRightsReceived': { 'created': true } }
      end

      def filter_notification_recipient(users_scope, activity:, **_unused_options)
        users_scope.where(id: activity.item.recipient.id)
      end

      def generate_commands(recipient:, activity:, **_unused_options)
        notification = activity.item
        [{
          event_payload: {
            project_folder_id: notification.post.id,
            project_folder_title_multiloc: notification.post.title_multiloc,
            project_folder_projects_count: notification.post.projects.count,
            project_folder_url: model_to_url(notification.post, locale: recipient.locale)
          }
        }]
      end

      def url_service
        @url_service ||= Frontend::UrlService.new
      end
    end
  end
end
