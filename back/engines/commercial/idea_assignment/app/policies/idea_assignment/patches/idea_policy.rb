module IdeaAssignment
  module Patches
    module IdeaPolicy
      def permitted_attributes
        super.tap do |attributes|
          attributes.push(:assignee_id) if high_privileges?
        end
      end
    end
  end
end
