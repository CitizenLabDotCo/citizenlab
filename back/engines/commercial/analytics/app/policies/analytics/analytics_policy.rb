# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def index?
      active_admin_or_moderator?
    end
  end
end
