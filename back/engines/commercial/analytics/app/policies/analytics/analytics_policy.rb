# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def index?
      admin_or_moderator?
    end

    def create?
      admin_or_moderator?
    end

    def schema?
      admin_or_moderator?
    end

    private

    def admin_or_moderator?
      user&.active? && (user&.admin? || user&.project_moderator?)
    end
  end
end
