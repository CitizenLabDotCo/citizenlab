# frozen_string_literal: true

class PermissionsService
  DENIED_REASONS = {
    not_signed_in: 'not_signed_in',
    not_active: 'not_active',
    not_permitted: 'not_permitted',
    missing_data: 'missing_data',
    not_verified: 'not_verified'
  }.freeze

  def update_permissions_for_scope(scope)
    actions = Permission.available_actions scope
    remove_extras_actions(scope, actions)
    add_missing_actions(scope, actions)
  end

  def update_global_permissions
    update_permissions_for_scope(nil)
  end

  def update_all_permissions
    update_global_permissions

    Permission::SCOPE_TYPES.compact.each do |model_class|
      model_class.constantize.all.each { |scope| update_permissions_for_scope(scope) }
    end

    Permission.select(&:invalid?).each(&:destroy!)
  end

  def denied_reason_for_resource(user, action, resource = nil)
    scope = resource&.permission_scope
    permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

    if permission.blank? && Permission.available_actions(scope)
      update_permissions_for_scope scope
      permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
    end

    raise "Unknown action '#{action}' for resource: #{resource}" unless permission

    denied_reason_for_permission permission, user
  end

  def denied_reason_for_permission(permission, user)
    if permission.permitted_by == 'everyone_confirmed_email'
      new_denied_reason permission, user
    else
      old_denied_reason permission, user
    end
  end

  def requirements(permission, user)
    requirements = requirements_mapping[permission.permitted_by]
    mark_satisfied_requirements! requirements, user if user
    permitted = requirements.values.none? do |subrequirements|
      subrequirements.value? 'require'
    end
    {
      permitted: permitted,
      requirements: requirements
    }
  end

  private

  def remove_extras_actions(scope, actions = nil)
    actions ||= Permission.available_actions(scope)
    Permission.where(permission_scope: scope)
      .where.not(action: actions)
      .destroy_all
  end

  def add_missing_actions(scope, actions = nil)
    missing_actions = missing_actions(scope, actions)
    permissions_hashes = missing_actions.map { |action| { action: action } }
    Permission.create!(permissions_hashes) { |p| p.permission_scope = scope }
  end

  def missing_actions(scope, actions = nil)
    actions ||= Permission.available_actions(scope)
    actions - Permission.where(permission_scope: scope).pluck(:action)
  end

  def old_denied_reason(permission, user)
    return if permission.permitted_by == 'everyone'
    return DENIED_REASONS[:not_signed_in] if !user
    return DENIED_REASONS[:not_active] if !user.active?

    return if UserRoleService.new.can_moderate? permission.permission_scope, user

    reason = case permission.permitted_by
    when 'users' then :not_signed_in unless user
    when 'admins_moderators' then :not_permitted
    when 'groups' then denied_when_permitted_by_groups?(permission, user)
    else
      raise "Unsupported permitted_by: '#{permission.permitted_by}'."
    end

    DENIED_REASONS[reason]
  end

  def new_denied_reason(permission, user)
    if permission.permitted_by == 'everyone'
      user ||= User.new
    elsif !user
      return DENIED_REASONS[:not_signed_in]
    elsif !user.active?
      return DENIED_REASONS[:not_active]
    end

    return if requirements(permission, user)[:permitted]

    DENIED_REASONS[:missing_data]
  end

  def denied_when_permitted_by_groups?(permission, user)
    :not_permitted if !user.in_any_groups?(permission.groups)
  end

  def requirements_mapping
    everyone = {
      built_in: {
        first_name: 'dont_ask',
        last_name: 'dont_ask',
        email: 'dont_ask'
      },
      custom_fields: CustomField.registration.map(&:key).index_with { 'dont_ask' },
      special: {
        password: 'dont_ask',
        confirmation: 'dont_ask'
      }
    }
    {
      'everyone' => everyone,
      'everyone_confirmed_email' => everyone.deep_dup.tap do |everyone_confirmed_email|
        everyone_confirmed_email[:built_in][:email] = 'require'
        everyone_confirmed_email[:special][:confirmation] = 'require'
      end,
      'users' => everyone.deep_dup.tap do |users|
        users[:built_in][:first_name] = 'require'
        users[:built_in][:last_name] = 'require'
        users[:built_in][:email] = 'require'
        required_field_keys = CustomField.registration.required.map(&:key)
        users[:custom_fields].each_key do |key|
          users[:custom_fields][key] = 'require' if required_field_keys.include? key
        end
        users[:special][:password] = 'require'
        users[:special][:confirmation] = 'require' if AppConfiguration.instance.feature_activated?('user_confirmation')
      end,
      'groups' => {},
      'admins_moderators' => {}
    }
  end

  def mark_satisfied_requirements!(requirements, user)
    return requirements if !user

    requirements[:built_in]&.each_key do |attribute|
      requirements[:built_in][attribute] = 'satisfied' if !user.send(attribute).nil?
    end
    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields][key] = 'satisfied' if user.custom_field_values.key?(key)
    end
    requirements[:special]&.each_key do |special_key|
      is_satisfied = case special_key
      when :password
        !user.no_password?
      when :confirmation
        user.confirmed?
      end
      requirements[:special][special_key] = 'satisfied' if is_satisfied
    end
  end
end

PermissionsService.prepend_if_ee('Verification::Patches::PermissionsService')
