module IdeaAssignment
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :default_assignee, class_name: 'User', optional: true
          validate :assignee_can_moderate_project
        end
      end

      def assignee_can_moderate_project
        if default_assignee && project && !UserRoleService.new.can_moderate_project?(project, default_assignee)
          errors.add(
            :default_assignee_id,
            :assignee_can_not_moderate_project,
            message: 'The default assignee can not moderate the project'
          )
        end
      end
    end
  end
end
