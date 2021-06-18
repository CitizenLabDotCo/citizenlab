module ProjectManagement
  module Patches
    module TrackIntercomService
      def track_user?(user)
        return false if user.super_admin?

        super || user.project_moderator?
      end

      def user_attributes(user)
        super.merge(isProjectModerator: user.project_moderator?)
      end
    end
  end
end