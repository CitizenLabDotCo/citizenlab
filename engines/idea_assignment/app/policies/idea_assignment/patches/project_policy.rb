module IdeaAssignment
  module Patches
    module ProjectPolicy
      def shared_permitted_attributes
        super.tap do |attributes|
          attributes.push(:default_assignee_id)
        end
      end
    end
  end
end
