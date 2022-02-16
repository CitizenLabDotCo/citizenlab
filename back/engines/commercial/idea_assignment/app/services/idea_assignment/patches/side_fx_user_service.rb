module IdeaAssignment
  module Patches
    module SideFxUserService
      private

      def after_roles_changed(current_user, user)
        super
        IdeaAssignmentService.new.clean_idea_assignees_for_user! user
      end
    end
  end
end
