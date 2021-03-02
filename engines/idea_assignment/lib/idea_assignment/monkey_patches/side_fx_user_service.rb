module IdeaAssignment
  module MonkeyPatches
    module SideFxUserService
      def after_update(user, current_user)
        super
        remove_idea_assignments(user)
      end

      def remove_idea_assignments(user)
        super
        return unless lost_roles(user).any? { |role| role['type'] == 'admin' }

        moderatable_projects = ProjectPolicy::Scope.new(user, Project).moderatable
        user.assigned_ideas
            .where.not(project: moderatable_projects)
            .update(assignee_id: nil, updated_at: DateTime.now)
      end
    end
  end
end

::SideFxUserService.prepend(IdeaAssignment::MonkeyPatches::SideFxUserService)
