module ProjectFolders
  module Patches
    module UserRoleService
      def can_moderate_project? project, user
      end

      def can_moderate? object, user
      end

      def moderators_for_project project, scope=::User
        super.or(scope.project_folder_moderator(project.folder_id))
      end

      def moderators_for object, scope=::User
        case object.class.name
        when 'ProjectFolders::Folder'
          scope.admin.or(scope.project_folder_moderator(object.id))
        else
          super
        end
      end
    end
  end
end
