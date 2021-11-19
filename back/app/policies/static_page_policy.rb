class StaticPagePolicy < ApplicationPolicy
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

  def show?
    true
  end

  def by_slug?
    show?
  end

  def create?
    user&.active? && user&.admin?
  end

  def update?
    user&.active? && user&.admin?
  end

  def destroy?
    update?
  end

  def permitted_attributes
    [
      :slug,
      { title_multiloc: CL2_SUPPORTED_LOCALES },
      { body_multiloc: CL2_SUPPORTED_LOCALES }
    ]
  end
end

StaticPagePolicy.prepend_if_ee 'CustomizableNavbar::Patches::StaticPagePolicy'
