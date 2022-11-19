# frozen_string_literal: true

module BulkImportIdeas
  class ImportIdeasPolicy < ApplicationPolicy
    def bulk_create_xlsx?
      active_admin?
    end

    def example_xlsx?
      active_admin?
    end

    private

    def active_admin?
      return false unless user

      user.active? && user.admin?
    end
  end
end
