module IdeaAssignment
  module Patches
    module ProjectPolicy
      def permitted_attributes_for_update
        super.tap do |attributes|
          attributes.push(:default_assignee_id)
        end
      end
    end
  end
end
