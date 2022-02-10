module IdeaAssignment
  module Extensions
    module Idea
      def self.included(base)
        base.class_eval do
          belongs_to :assignee, class_name: 'User', optional: true
          validate :assignee_can_moderate_project, unless: :draft?
        end
      end

      def assignee_can_moderate_project
        if assignee && project && !UserRoleService.new.can_moderate_project?(project, assignee)
          errors.add(
            :assignee_id,
            :assignee_can_not_moderate_project,
            message: 'The assignee can not moderate the project of this idea'
          )
        end
      end
    end
  end
end
