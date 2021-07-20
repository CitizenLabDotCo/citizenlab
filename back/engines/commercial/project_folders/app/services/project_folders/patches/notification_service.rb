module ProjectFolders
  module Patches
    module NotificationService
      def notification_classes
        super + [
          ProjectFolders::Notifications::ProjectFolderModerationRightsReceived
        ]
      end
    end
  end
end
