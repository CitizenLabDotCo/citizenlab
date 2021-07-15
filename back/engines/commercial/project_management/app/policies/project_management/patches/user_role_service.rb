module ProjectManagement
  module Patches
    module UserRoleService
      def can_moderate_project? project, user
        super || user.project_moderator?(project.id)
      end

      def moderators_for_project project, scope=::User
        super.or scope.project_moderator(project.id)
      end

      def moderatable_projects user, scope=::Project
        if user.roles.pluck('type').include? 'project_moderator'
          project_ids = user.roles.select{ |role| role['type'] == 'project_moderator' }.pluck('project_id').compact.uniq
          super.or scope.where(id: project_ids)
        else
          super
        end
      end
    end 
  end
end
