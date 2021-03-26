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
    user&.active? && user.admin?
  end

  def index_xlsx?
    user&.active? && user.admin?
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
     record.id == user&.id || (user&.active? && user.admin?)
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
    # When the policy was created with a class
    # instead of an instance, record is set to
    # that class.
    instance = if record.is_a? Class
      nil
    else
      record
    end
    (user && (instance&.id == user.id || user.admin?)) || instance&.invite_pending?
  end

  def permitted_attributes
    shared = [:first_name, :last_name, :email, :password, :avatar, :locale, custom_field_values: allowed_custom_field_keys, bio_multiloc: CL2_SUPPORTED_LOCALES]
    admin? ? shared + role_permitted_params : shared
  end

  def role_permitted_params
    [roles: %i[type project_id]]
  end

  def permitted_attributes_for_complete_registration
    [custom_field_values: allowed_custom_field_keys]
  end

  private

  def allowed_custom_field_keys
    enabled_fields = enabled_custom_fields
    simple_keys = enabled_fields.support_single_value.pluck(:key).map(&:to_sym)
    array_keys = enabled_fields.support_multiple_values.pluck(:key).map(&:to_sym)
    [*simple_keys, array_keys.map{|k| [k, []]}.to_h]
  end

  def enabled_custom_fields
    CustomField
      .with_resource_type('User')
      .enabled
      .not_hidden
  end
end

UserPolicy.prepend_if_ee('ProjectFolders::Patches::UserPolicy')
UserPolicy.prepend_if_ee('Verification::Patches::UserPolicy')
