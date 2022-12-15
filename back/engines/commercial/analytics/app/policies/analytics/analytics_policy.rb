# frozen_string_literal: true

module Analytics
  class AnalyticsPolicy < ::ApplicationPolicy
    def index?
      admin?
    end

    def create?
      admin?
    end

    def schema?
      admin?
    end

    private

    def admin
      user&.active? && user&.admin?
    end
  end
end
