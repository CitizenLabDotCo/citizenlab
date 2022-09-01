# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def index?
      user&.active? && user&.admin?
    end
  end
end
