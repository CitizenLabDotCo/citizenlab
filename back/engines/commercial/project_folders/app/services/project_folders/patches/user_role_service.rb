module ProjectFolders
  module Patches
    module UserRoleService
      def can_moderate? object, user
        case object.class.name
        when 'ProjectFolders::Folder'
          user.admin_or_folder_moderator? object.id
        else
          super
        end
      end

      def can_moderate_project? project, user
        super || (project.folder_id && user.project_folder_moderator?(project.folder_id))
      end

      def moderators_for object, scope=::User
        case object.class.name
        when 'ProjectFolders::Folder'
          scope.admin.or(scope.project_folder_moderator(object.id))
        else
          super
        end
      end

      def moderators_for_project project, scope=::User
        if project.folder_id
          super.or scope.project_folder_moderator(project.folder_id)
        else
          super
        end
      end

      def moderatable_projects user, scope=::Project
        if user.roles.pluck('type').include? 'project_folder_moderator'
          folder_ids = user.roles.select{ |role| role['type'] == 'project_folder_moderator' }.pluck('project_folder_id').compact.uniq
          super.or(scope.includes(:admin_publication).where(admin_publications: { parent: AdminPublication.where(publication: ProjectFolders::Folder.where(id: folder_ids)) }))
        else
          super
        end
      end
    end
  end
end
