class NavbarItemPolicy < ApplicationPolicy
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

NavbarItemPolicy.include_if_ee('Navbar::Extensions::NavbarItemPolicy')
