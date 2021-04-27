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

          after_update :clean_idea_assignments, if: :saved_change_to_roles?
          after_destroy :clear_idea_assignments
        end
      end

      def clean_idea_assignments
        lost_roles = saved_change_to_roles[0] - saved_change_to_roles[1]
        _clean_idea_assignments(lost_roles)
      end

      def clear_idea_assignments
        _clean_idea_assignments(roles)
      end

      private

      def _clean_idea_assignments(lost_roles)
        return if (lost_roles.pluck('type') & %w[admin project_moderator]).empty?

        moderatable_projects = ::ProjectPolicy::Scope.new(self, ::Project).moderatable
        assigned_ideas.where.not(project: moderatable_projects)
                      .update(assignee_id: nil, updated_at: DateTime.now)

        default_assigned_projects.where.not(id: moderatable_projects)
                                 .update(default_assignee_id: nil, updated_at: DateTime.now)
      end
    end
  end
end
