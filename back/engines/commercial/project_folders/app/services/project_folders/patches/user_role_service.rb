# frozen_string_literal: true

module ProjectFolders
  module Patches
    module UserRoleService
      def can_moderate?(object, user)
        case object.class.name
        when 'ProjectFolders::Folder'
          user.admin_or_folder_moderator? object.id
        else
          super
        end
      end

      def can_moderate_project?(project, user)
        super || (project.folder_id && user.project_folder_moderator?(project.folder_id))
      end

      def moderators_for(object, scope = ::User)
        case object.class.name
        when 'ProjectFolders::Folder'
          scope.admin.or(scope.project_folder_moderator(object.id))
        else
          super
        end
      end

      def moderators_for_project(project, scope = ::User)
        if project.folder_id
          super.or scope.project_folder_moderator(project.folder_id)
        else
          super
        end
      end

      def moderatable_projects(user, scope = ::Project)
        return super unless user.project_folder_moderator?

        admin_publications =
          AdminPublication.joins(:parent)
                          .where(parents_admin_publications: {
                                   publication_type: 'ProjectFolders::Folder',
                                   publication_id: user.moderated_project_folder_ids
                                 })

        super.or(scope.where(admin_publication: admin_publications))
      end
    end
  end
end
