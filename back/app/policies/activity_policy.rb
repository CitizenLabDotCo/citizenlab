# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        activities = scope.none

        Activity::MANAGEMENT_FILTERS.each do |filter|
          activities = activities.or(scope.where(
            item_type: filter[:item_type],
            action: filter[:actions]
          ))
        end

        activities
      else
        scope.none
      end
    end
  end

  def index?
    user&.admin?
  end
end
