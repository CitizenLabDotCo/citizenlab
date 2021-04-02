# frozen_string_literal: true

module ProjectFolders
  module Patches
    module ProjectPolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
      end

      module Scope
        def resolve
          if user&.project_folder_moderator? && !user&.admin?
            folder_publication_ids = user.moderated_project_folders
                                         .includes(:admin_publication)
                                         .pluck('admin_publications.id')

            all_ids = user.moderatable_project_ids + scope.user_groups_visible(user).not_draft.or(scope.publicly_visible.not_draft)

            scope.includes(:admin_publication)
                 .where(admin_publications: { parent_id: folder_publication_ids })
                 .or(scope.includes(:admin_publication).where(projects: { id: all_ids }))
          else
            super
          end
        end
      end

      def create?
        super || user&.moderates_parent_folder?(record)
      end
    end
  end
end
