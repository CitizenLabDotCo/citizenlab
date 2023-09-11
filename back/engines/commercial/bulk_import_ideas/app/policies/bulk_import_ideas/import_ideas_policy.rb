# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasPolicy < ApplicationPolicy
    def show?
      active_admin?
    end

    def bulk_create?
      active_admin?
    end

    def example_xlsx?
      active_admin?
    end

    def draft_ideas?
      # active_admin_or_project_moderator?
      active_admin?
    end

    def idea_import?
      active_admin?
    end

    private

    def active_admin?
      return false unless user

      user.active? && user.admin?
    end

    # def active_admin_or_project_moderator?
    #   return false unless user

    #   user.active? && UserRoleService.new.can_moderate_project?(record, user)
    # end
  end
end
