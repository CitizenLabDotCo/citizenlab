module IdeaAssignment
  module Extensions
    module User
      def self.included(base)
        base.class_eval do
          has_many :assigned_ideas, class_name: 'Idea', foreign_key: :assignee_id, dependent: :nullify
          has_many :default_assigned_projects,
                   class_name: 'Project',
                   foreign_key: :default_assignee_id,
                   dependent: :nullify

          after_update :clean_assignments, if: :saved_change_to_roles?
          after_destroy :clear_assignments
        end
      end

      def clean_assignments
        lost_roles = saved_change_to_roles[1] - saved_change_to_roles[0]
        _clean_assignments(lost_roles)
      end

      def clear_assignments
        _clean_assignments(roles)
      end

      def _clean_assignments(lost_roles)
        return if (lost_roles.pluck('type') & %w[admin project_moderator]).empty?

        moderatable_projects = ::ProjectPolicy::Scope.new(user, Project).moderatable
        user.assigned_ideas
            .where.not(project: moderatable_projects)
            .update(assignee_id: nil, updated_at: DateTime.now)

        user.default_assigned_projects
            .where.not(id: moderatable_projects)
            .update(default_assignee_id: nil, updated_at: DateTime.now)
      end
    end
  end
end
