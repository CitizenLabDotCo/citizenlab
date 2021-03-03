module ProjectFolders
  module Notifications
    class ProjectFolderModerationRightsReceived < Notification
      belongs_to :project_folder, class_name: 'ProjectFolders::Folder', optional: true

      validates :project_folder, presence: true

      ACTIVITY_TRIGGERS = { 'User': { 'project_folder_moderation_rights_given': true } }.freeze
      EVENT_NAME = 'Project Folder moderation rights received'.freeze

      def self.make_notifications_on(activity)
        recipient_id      = activity.item_id
        initiator_id      = activity.user_id
        project_folder_id = activity.payload['project_folder_id']
        project_folder    = ProjectFolders::Folder.find(project_folder_id)
        return [] unless project_folder && recipient_id

        [new(recipient_id: recipient_id, initiating_user_id: initiator_id, project_folder: project_folder)]
      end
    end
  end
end
