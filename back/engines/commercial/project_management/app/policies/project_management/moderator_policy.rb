# frozen_string_literal: true

module ProjectManagement
  class ModeratorPolicy < ApplicationPolicy
    def index?
      admin_or_moderator?
    end

    def show?
      admin_or_moderator?
    end

    def create?
      admin_or_moderator?
    end

    def destroy?
      admin_or_moderator?
    end

    def users_search?
      admin_or_moderator?
    end

    private

    def admin_or_moderator?
      # In the case of moderator, the user must be moderator of that project
      # (not just of any project).
      user&.active? && (user&.admin? || user&.project_moderator?(record.project_id))
    end
  end
end
