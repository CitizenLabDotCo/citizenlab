# frozen_string_literal: true

class SpamReportPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def create?
    user&.active? && (record.user_id == user.id || user&.admin?)
  end

  def show?
    user&.active? && (record.user_id == user.id || user&.admin?)
  end

  def update?
    user&.active? && (record.user_id == user.id || user&.admin?)
  end

  def destroy?
    update?
  end
end
