# frozen_string_literal: true

module ProjectFolders
  class FolderPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        if user&.admin? || user&.moderator?
          scope.all
        else
          published_folders
        end
      end

      def published_folders
        scope.where(admin_publication: AdminPublication.not_draft)
      end
    end

    def index_for_admin?
      user&.admin? || user&.space_moderator? || user&.project_folder_moderator?
    end

    def show?
      return true if user && UserRoleService.new.can_moderate?(record, user)
      return false if record.admin_publication.draft?
      return true if record.projects.empty?

      # We check if the user has access to at least one of the projects in the folder
      scope_for(record.projects).exists?
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
          description_multiloc: CL2_SUPPORTED_LOCALES,
          description_preview_multiloc: CL2_SUPPORTED_LOCALES,
          title_multiloc: CL2_SUPPORTED_LOCALES,
          header_bg_alt_text_multiloc: CL2_SUPPORTED_LOCALES }
      ]

      attrs << :space_id if user&.admin? || user&.space_moderator?
      attrs
    end
  end
end
