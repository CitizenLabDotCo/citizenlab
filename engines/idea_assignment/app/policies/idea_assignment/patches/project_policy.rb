module IdeaAssignment
  module Patches
    module ProjectPolicy
      def permitted_attributes_for_update
        super.push(:default_assignee_id)
      end
    end
  end
end
