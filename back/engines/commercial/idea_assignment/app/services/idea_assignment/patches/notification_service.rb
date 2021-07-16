module IdeaAssignment
  module Patches
    module NotificationService
      def notification_classes
        super + [
          IdeaAssignment::Notifications::IdeaAssignedToYou
        ]
      end
    end
  end
end
