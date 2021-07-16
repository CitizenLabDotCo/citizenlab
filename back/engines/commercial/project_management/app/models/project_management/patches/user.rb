# frozen_string_literal: true

module ProjectManagement
  module Patches
    module User
      def self.prepended(base)
        base.singleton_class.prepend(ClassMethods)
        base.include(IdeaAssignment)
        base.class_eval do
          scope :project_moderator, lambda { |project_id = nil|
            if project_id
              where('roles @> ?', JSON.generate([{ type: 'project_moderator', project_id: project_id }]))
            else
              where("roles @> '[{\"type\":\"project_moderator\"}]'")
            end
          }

          scope :not_project_moderator, -> { where.not(id: ::User.project_moderator) }
        end
      end

      module ClassMethods
        def enabled_roles
          super << 'project_moderator'
        end
      end

      def moderatable_project_ids
        roles.select { |role| role['type'] == 'project_moderator' }.pluck("project_id").compact
      end

      def moderatable_project_ids_was
        roles_was.select { |role| role['type'] == 'project_moderator' }.pluck("project_id").compact
      end

      def moderatable_projects
        ::Project.where(id: moderatable_project_ids)
      end

      def project_moderator?(project_id = nil)
        project_id ? moderatable_project_ids.include?(project_id) : moderatable_project_ids.present?
      end

      module IdeaAssignment
        def self.included(base)
          base.before_save :reset_project_and_idea_assignments, if: :lost_rights_over_assigned_projects_or_ideas?
        end

        # When a user loses project management rights over a project, and is the default assignee, or assignee of some ideas,
        # change it to the oldest admin.
        def reset_project_and_idea_assignments
          lost_assigned_moderatable_projects.update(default_assignee: self.class.oldest_admin)
          lost_assigned_moderated_ideas.update(assignee: self.class.oldest_admin)
        end

        def lost_rights_over_assigned_projects_or_ideas?
          return false if admin?

          lost_assigned_moderatable_projects.any? || lost_assigned_moderated_ideas.any?
        end

        def lost_assigned_moderatable_projects
          ::Project.where(id: moderatable_project_ids_was - moderatable_project_ids, default_assignee: self)
        end

        def lost_assigned_moderated_ideas
          Idea.includes(:project).where(project_id: (moderatable_project_ids_was - moderatable_project_ids), assignee: self)
        end
      end
    end
  end
end
