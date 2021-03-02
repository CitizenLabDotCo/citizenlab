module IdeaAssignment
  module Patches
    module SideFxModeratorService
      def after_destroy(moderator, project, _current_user)
        remove_idea_assignments(moderator, project)
        super
      end

      def remove_idea_assignments(moderator, project)
        moderator.assigned_ideas
                 .where(project: project)
                 .update(assignee_id: nil, updated_at: DateTime.now)
      end
    end
  end
end

::SideFxIdeaService.prepend_if_ee('IdeaAssignment::MonkeyPatches::SideFxModeratorService')
