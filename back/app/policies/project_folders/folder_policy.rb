# frozen_string_literal: true

module ProjectFolders
  class FolderPolicy < ApplicationPolicy
    # The one rule for who may see a folder. Listing folders uses it, and so does opening one:
    # show? is inherited from ApplicationPolicy, which checks the folder is in this scope.
    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.all if user&.admin?

        moderated_folders.or(scope.where(id: visible_publications.select(:publication_id)))
      end

      private

      # Folders the user moderates, directly or through their space, whatever their status.
      def moderated_folders
        user ? UserRoleService.new.moderatable_folders(user, scope) : scope.none
      end

      # Anyone sees a folder that is not a draft and is either empty or holds at least one
      # project they can see. A folder of only hidden projects is hidden too.
      def visible_publications
        folders = AdminPublication.where(publication_type: ProjectFolders::Folder.name).not_draft
        projects = AdminPublication.where(publication_type: Project.name)

        with_visible_project = projects.where(publication: scope_for(Project)).select(:parent_id)
        with_any_project = projects.where.not(parent_id: nil).select(:parent_id)

        folders.where(id: with_visible_project).or(folders.where.not(id: with_any_project))
      end
    end

    def index_for_admin?
      user&.admin? || user&.space_moderator? || user&.project_folder_moderator?
    end

    def by_slug?
      show?
    end

    def create?
      return unless user&.active?

      return true if user.admin?

      if record.space_id && user.space_moderator?(record.space_id)
        return true
      end

      false
    end

    def update?
      return unless user&.active?

      create? || UserRoleService.new.can_moderate?(record, user)
    end

    def destroy?
      create?
    end

    # Returns a list of permitted attributes that a user can change
    # @return [Array]
    def permitted_attributes
      attrs = [
        :header_bg,
        :slug,
        { admin_publication_attributes: %i[publication_status scheduled_status scheduled_at],
          description_preview_multiloc: CL2_SUPPORTED_LOCALES,
          title_multiloc: CL2_SUPPORTED_LOCALES,
          header_bg_alt_text_multiloc: CL2_SUPPORTED_LOCALES }
      ]

      attrs << :space_id if user&.admin? || user&.space_moderator?
      attrs
    end
  end
end
