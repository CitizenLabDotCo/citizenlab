module IdeaAssignment
  module Patches
    module SideFxModeratorService
      def after_destroy(moderator, project, _current_user)
        remove_idea_assignments(moderator, project)
        remove_project_assignments(moderator, project)
        super
      end

      private

      def remove_idea_assignments(moderator, project)
        moderator.assigned_ideas
                 .where(project: project)
                 .update(assignee_id: nil, updated_at: DateTime.now)
      end

      def remove_project_assignments(moderator, project)
        project.update(default_assignee: nil) if project.default_assignee == moderator
      end
    end
  end
end
