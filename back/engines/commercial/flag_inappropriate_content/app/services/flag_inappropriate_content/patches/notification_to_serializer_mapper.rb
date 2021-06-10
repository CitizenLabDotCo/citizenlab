module FlagInappropriateContent
  module Patches
    module NotificationToSerializerMapper

      def map
        super.merge(
          FlagInappropriateContent::Notifications::InappropriateContentFlagged => ::WebApi::V1::InappropriateContentFlaggedSerializer
        )
      end
    end
  end
end
