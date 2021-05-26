module IdeaAssignment
  module Patches
    module NotificationToSerializerMapper

      def map
        super.merge(
          IdeaAssignment::Notifications::IdeaAssignedToYou => IdeaAssignment::WebApi::V1::Notifications::IdeaAssignedToYouSerializer
        )
      end
    end
  end
end