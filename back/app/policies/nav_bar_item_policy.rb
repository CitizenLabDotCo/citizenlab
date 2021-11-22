class NavBarItemPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def removed_default_items?
    user&.active? && user&.admin?
  end

  def toggle_proposals?
    user&.active? && user&.admin?
  end

  def toggle_events?
    user&.active? && user&.admin?
  end

  def toggle_all_input?
    user&.active? && user&.admin?
  end
end

NavBarItemPolicy.include_if_ee 'CustomizableNavbar::Extensions::NavBarItemPolicy'
