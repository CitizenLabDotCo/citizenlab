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

  def by_invite?
    record&.invite_pending?
  end

  def update?
    user&.active? && (record.id == user.id || user.admin?)
  end

  def complete_registration?
    user && !user.active? && (record.id == user.id)
  end

  def destroy?
    user&.active? && user.admin?
  end

  def view_private_attributes?
    (user && (record.id == user.id || user.admin?)) || record.invite_pending?
  end

  def permitted_attributes
    shared = [:first_name, :last_name, :email, :password, :avatar, :locale, custom_field_values: allowed_custom_field_keys, bio_multiloc: CL2_SUPPORTED_LOCALES]
    if user && user.admin?
      shared + [roles: [:type, :project_id]]
    else
      shared
    end
    unchangeable_attributes = SingleSignOnService.new.attributes_user_cant_change(user)
    shared - unchangeable_attributes
  end

  def permitted_attributes_for_complete_registration
    [custom_field_values: allowed_custom_field_keys]
  end

  private
  
  def allowed_custom_field_keys
    enabled_keys = CustomField.fields_for(User).enabled.pluck(:key).map(&:to_sym)
    unchangeable_keys = SingleSignOnService.new.custom_fields_user_cant_change(user)
    enabled_keys - unchangeable_keys
  end
end
