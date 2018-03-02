class CustomFieldOptionPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope
    end
  end

  def create?
    user&.admin? && !record.custom_field.code
  end

  def update?
    user&.admin? && !record.custom_field.code
  end

  def show?
    true
  end

  def destroy?
    user&.admin? && !record.custom_field.code
  end
end
