# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def create?
      user&.active? && user&.admin?
    end
  end
end
