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

  def by_slug?
    show?
  end

  def update?
    user && (record.id == user.id || user.admin?)
  end

  def destroy?
    user && user.admin?
  end

  def view_private_attributes?
    user && (record.id == user.id || user.admin?)
  end

  def permitted_attributes
    shared = [:first_name, :last_name, :email, :password, :avatar, :locale, :gender, :birthyear, :domicile, :education, custom_field_values: {}, bio_multiloc: I18n.available_locales]
    if user && user.admin?
      shared + [roles: [:type, :project_id]]
    else
      shared
    end
  end
end
