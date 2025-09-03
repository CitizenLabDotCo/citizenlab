# frozen_string_literal: true

class StaticPageFilePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where static_page: scope_for(StaticPage)
    end
  end

  def create?
    policy_for(record.static_page).update?
  end

  def show?
    policy_for(record.static_page).show?
  end

  def update?
    policy_for(record.static_page).update?
  end

  def destroy?
    policy_for(record.static_page).update?
  end
end
