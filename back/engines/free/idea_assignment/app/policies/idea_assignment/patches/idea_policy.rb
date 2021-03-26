module IdeaAssignment
  module Patches
    module IdeaPolicy
      def permitted_attributes
        super.tap do |attributes|
          attributes.push(:assignee_id) if admin_or_project_moderator?
        end
      end
    end
  end
end
