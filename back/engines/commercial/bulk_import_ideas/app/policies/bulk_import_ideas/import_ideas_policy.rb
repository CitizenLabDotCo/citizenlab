# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasPolicy < ApplicationPolicy
    def bulk_create_xlsx?
      active_admin?
    end

    def bulk_create_pdf?
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

    def active_admin?
      return false unless user

      user.active? && user.admin?
    end
  end
end
