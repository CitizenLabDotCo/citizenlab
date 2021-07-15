module FlagInappropriateContent
  module Patches
    module NotificationService
      def notification_classes
        super + [
          FlagInappropriateContent::Notifications::InappropriateContentFlagged
        ]
      end
    end
  end
end
