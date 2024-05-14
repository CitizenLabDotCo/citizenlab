# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin? && user&.active?
        activities = scope.where(acted_at: 30.days.ago..Time.now).where(user: User.admin_or_moderator)
        result = scope.none

        Activity::MANAGEMENT_FILTERS.each do |filter|
          result = result.or(activities.where(
            item_type: filter[:item_type],
            action: filter[:actions]
          ))
        end

        result
      else
        scope.none
      end
    end
  end
end
