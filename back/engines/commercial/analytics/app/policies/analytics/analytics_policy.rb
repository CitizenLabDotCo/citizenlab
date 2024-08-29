# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def index?
      active_admin_or_moderator?
    end

    def create?
      active_admin_or_moderator?
    end

    def schema?
      active_admin_or_moderator?
    end
  end
end
