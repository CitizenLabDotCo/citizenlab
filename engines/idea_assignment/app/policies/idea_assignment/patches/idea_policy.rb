module IdeaAssignment
  module Patches
    module IdeaPolicy
      def permitted_attributes
        super.push(:assignee_id) if admin_or_project_moderator?
      end
    end
  end
end
