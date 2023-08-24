# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportsPolicy < ApplicationPolicy
    def show?
      active_admin?
    end

    private

    def active_admin?
      return false unless user

      user.active? && user.admin?
    end
  end
end
