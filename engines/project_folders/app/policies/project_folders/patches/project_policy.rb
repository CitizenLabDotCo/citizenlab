# frozen_string_literal: true

module ProjectFolders
  module Patches
    module ProjectPolicy
      module Scope
        def resolve
          super.or resolve_for_project_folder_moderator_only
        end

        private

        def resolve_for_project_folder_moderator_only
          return scope.none unless user&.project_folder_moderator?

          folder_publication_ids = user.moderated_project_folders
                                       .includes(:admin_publication)
                                       .pluck('admin_publications.id')

          scope.where(admin_publications: { parent_id: folder_publication_ids })
        end
      end

      def create?
        super || user&.moderates_parent_folder?(record)
      end
    end
  end
end
