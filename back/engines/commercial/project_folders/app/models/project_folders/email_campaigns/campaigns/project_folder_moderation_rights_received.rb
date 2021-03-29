return unless defined? ::EmailCampaigns::Campaign

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

      delegate :admin_project_folder_url, to: :url_service

      def mailer_class
        ProjectFolderModerationRightsReceivedMailer
      end

      def activity_triggers
        { 'ProjectFolders::Notifications::ProjectFolderModerationRightsReceived' => { 'created' => true } }
      end

      def filter_notification_recipient(users_scope, activity:, **_unused_options)
        users_scope.where(id: activity.item.id)
      end

      def generate_commands(recipient:, activity:, **_unused_options)
        # notification = activity.item
        folder = ProjectFolders::Folder.find(activity.payload['project_folder_id'])
        [{
          event_payload: {
            project_folder_id: folder.id,
            project_folder_title_multiloc: folder.title_multiloc,
            project_folder_projects_count: folder.projects.count,
            project_folder_url: admin_project_folder_url(folder.id, locale: recipient.locale)
          }
        }]
      end

      def url_service
        @url_service ||= Frontend::UrlService.new
      end
    end
  end
end
