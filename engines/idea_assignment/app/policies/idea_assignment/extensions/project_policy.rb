module IdeaAssignment
  module Extensions
    module ProjectPolicy
      def self.included(base)
        base.class_eval do
          permit_attribute :default_assignee_id
        end
      end
    end
  end
end
