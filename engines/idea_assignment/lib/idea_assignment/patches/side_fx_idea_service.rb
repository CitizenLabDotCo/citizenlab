module IdeaAssignment
  module Patches
    module SideFxIdeaService
      def before_update(idea, user)
        super
        idea.assignee = nil if idea.project_id_changed? && !ProjectPolicy.new(idea.assignee, idea.project).moderate?
      end

      def after_update(idea, user)
        super
        return unless idea.assignee_id_previously_changed?

        initiating_user = @automatic_assignment ? nil : user
        LogActivityJob.perform_later(idea, 'changed_assignee', initiating_user, idea.updated_at.to_i,
                                     payload: { change: idea.assignee_id_previous_change })
      end

      def before_publish(idea, user)
        super
        assign_assignee(idea)
      end

      def assign_assignee(idea)
        return unless idea.project&.default_assignee && !idea.assignee

        idea.assignee = idea.project.default_assignee
        @automatic_assignment = true
      end
    end
  end
end

::SideFxIdeaService.prepend_if_ee('IdeaAssignment::Patches::SideFxIdeaService')
