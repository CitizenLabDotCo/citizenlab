# frozen_string_literal: true

module ProjectManagement
  module Patches
    module TrackSegmentService
      def user_traits(user)
        super.merge(isProjectModerator: user.project_moderator?)
      end

      # @param [Symbol] role
      def intercom_integration_enabled?(role)
        super || role == :project_moderator
      end

      # @param [Symbol] role
      def satismeter_integration_enabled?(role)
        super || role == :project_moderator
      end
    end
  end
end
