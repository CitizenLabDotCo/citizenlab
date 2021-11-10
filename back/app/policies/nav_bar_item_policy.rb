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
end

# NavBarItemPolicy.include_if_ee('CustomizableNavbar::Extensions::NavBarItemPolicy')
