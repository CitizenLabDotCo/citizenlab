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
      active_admin?
    end

    def idea_import?
      active_admin?
    end

    private

    def active_user?
      return false unless user

      user.active?
    end

    def active_admin?
      active_user? && user.admin?
    end
  end
end
