# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasPolicy < ApplicationPolicy
    def show?
      active_admin_or_project_moderator?
    end

    def bulk_create?
      active_admin_or_project_moderator?
    end

    def example_xlsx?
      active_admin_or_project_moderator?
    end

    def draft_ideas?
      active_admin_or_project_moderator?
    end

    def idea_import?
      active_admin_or_project_moderator?
    end

    private

    def active_user?
      return false unless user

      user.active?
    end

    # def active_admin?
    #   active_user? && user.admin?
    # end

    def active_admin_or_project_moderator?
      active_user? && (user.admin? || user.project_moderator?)
    end
  end
end
