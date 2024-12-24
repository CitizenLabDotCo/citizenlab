# frozen_string_literal: true

class MembershipPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def create?
    user&.active? && user&.admin?
  end

  def show?
    user&.active? && user&.admin?
  end

  def show_by_user_id?
    show?
  end

  def destroy?
    user&.active? && user&.admin?
  end

  def destroy_by_user_id?
    destroy?
  end

  def users_search?
    user&.active? && user&.admin?
  end
end
