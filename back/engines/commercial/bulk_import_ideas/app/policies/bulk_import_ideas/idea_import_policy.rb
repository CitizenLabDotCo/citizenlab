# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportPolicy < ApplicationPolicy
    def show?
      UserRoleService.new.can_moderate_project?(record.idea.project, user)
    end
  end
end
