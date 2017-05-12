class UserPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user && user.admin?
        scope
      elsif user
        scope.where(id: user.id)
      else
        scope.none
      end
    end
  end

  def create?
    true
  end

  def show?
    true
  end

  def update?
    user && (record.id == user.id || user.admin?)
  end

  def view_private_attributes?
    user && (record.id == user.id || user.admin?)
  end

  def permitted_attributes
    if user && user.admin?
      [:first_name, :last_name, :email, :password, :avatar, :locale, roles: [:type, :project_id]]
    else
      [:first_name, :last_name, :email, :password, :avatar, :locale]
    end
  end
end
