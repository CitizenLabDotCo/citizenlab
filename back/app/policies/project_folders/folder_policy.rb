# frozen_string_literal: true

module ProjectFolders
  class FolderPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        if user&.admin? || user&.project_folder_moderator? || user&.project_moderator?
          scope.all
        else
          published_folders
        end
      end

      def published_folders
        scope.includes(:admin_publication).where.not(admin_publications: { publication_status: 'draft' })
      end
    end

    def index_for_admin?
      return true if user && UserRoleService.new.can_moderate?(record, user)
    end

    def show?
      return true if user && UserRoleService.new.can_moderate?(record, user)
      return false if record.admin_publication.publication_status == 'draft'
      return true if record.projects.empty?

      # We check if the user has access to at least one of the projects in the folder
      scope_for(record.projects).exists?
    end

    def by_slug?
      show?
    end

    def create?
      return unless user&.active?

      user.admin?
    end

    def update?
      return unless user&.active?

      create? || user&.project_folder_moderator?(record.id)
    end

    def destroy?
      create?
    end
  end

  # Returns a list of permitted attributes that a user can change
  # @return [Array]
  def permitted_attributes
    [
      :header_bg,
      :slug,
      { admin_publication_attributes: [:publication_status],
        description_multiloc: CL2_SUPPORTED_LOCALES,
        description_preview_multiloc: CL2_SUPPORTED_LOCALES,
        title_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end
end
