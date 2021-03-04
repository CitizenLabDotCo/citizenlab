module IdeaAssignment
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :default_assignee, class_name: 'User', optional: true
        end
      end

      def assignee_can_moderate_project
        return unless assignee && project && !ProjectPolicy.new(assignee, project).moderate?

        errors.add(
          :assignee_id,
          :assignee_can_not_moderate_project,
          message: 'The assignee can not moderate the project of this idea'
        )
      end
    end
  end
end
