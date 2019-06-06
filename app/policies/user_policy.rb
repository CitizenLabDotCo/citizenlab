class UserPolicy < ApplicationPolicy
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

  def index?
    user&.active? && (user.admin? || user.project_moderator?)
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
    user&.active? && (record.id == user.id || user.admin?)
  end

  def ideas_count?
    true
  end

  def initiatives_count?
    true
  end

  def comments_count?
    true
  end

  def view_private_attributes?
    (user && (record.id == user.id || user.admin?)) || record.invite_pending?
  end

  def permitted_attributes
    shared = [:first_name, :last_name, :email, :password, :avatar, :locale, custom_field_values: allowed_custom_field_keys, bio_multiloc: CL2_SUPPORTED_LOCALES]
    if user && user.admin?
      shared += [roles: [:type, :project_id]]
    end
    unchangeable_attributes = SingleSignOnService.new.attributes_user_cant_change(user)
    shared - unchangeable_attributes
  end

  def permitted_attributes_for_complete_registration
    [custom_field_values: allowed_custom_field_keys]
  end

  private

  def allowed_custom_field_keys
    unchangeable_keys = SingleSignOnService.new.custom_fields_user_cant_change(user)
    enabled_fields = CustomField
      .fields_for(User)
      .where.not(key: unchangeable_keys)
      .enabled
    simple_keys = enabled_fields.support_single_value.pluck(:key).map(&:to_sym)
    array_keys = enabled_fields.support_multiple_values.pluck(:key).map(&:to_sym)

    [*simple_keys, array_keys.map{|k| [k, []]}.to_h]
  end
end
