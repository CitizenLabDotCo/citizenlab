module IdeaAssignment
  module Patches
    module SideFxIdeaService
      def before_update(idea, user)
        super
        if idea.project_id_changed? && !UserRoleService.new.can_moderate_project?(idea.project, idea.assignee)
          idea.assignee = nil
        end
      end

      def after_update(idea, user)
        super
        return if !idea.assignee_id_previously_changed?

        initiating_user = @automatic_assignment ? nil : user
        LogActivityJob.perform_later(idea, 'changed_assignee', initiating_user, idea.updated_at.to_i,
                                     payload: { change: idea.assignee_id_previous_change })
      end

      def before_publish(idea, user)
        super
        assign_assignee(idea)
      end

      def assign_assignee(idea)
        return if !idea.project&.default_assignee || idea.assignee

        idea.assignee = idea.project.default_assignee
        @automatic_assignment = true
      end
    end
  end
end
