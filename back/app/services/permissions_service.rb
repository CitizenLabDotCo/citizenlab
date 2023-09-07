# frozen_string_literal: true

class PermissionsService
  DENIED_REASONS = {
    not_signed_in: 'not_signed_in',
    not_active: 'not_active',
    not_permitted: 'not_permitted',
    not_in_group: 'not_in_group',
    missing_data: 'missing_data',
    not_verified: 'not_verified',
    blocked: 'blocked'
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
    denied_reason permission, user
  end

  def requirements(permission, user)
    requirements = base_requirements permission
    mark_satisfied_requirements! requirements, permission, user if user
    ignore_password_for_sso! requirements, user if user
    permitted = requirements.values.none? do |subrequirements|
      subrequirements.value? 'require'
    end
    {
      permitted: permitted,
      requirements: requirements
    }
  end

  def requirements_fields(permission)
    if permission.global_custom_fields
      CustomField.registration.enabled.order(:ordering)
    else
      permission.permissions_custom_fields.map do |permissions_custom_field|
        permissions_custom_field.custom_field.tap do |field|
          field.enabled = true # Need to overide this to ensure it gets displayed when not enabled at platform level
          field.required = permissions_custom_field.required
        end
      end
    end
  end

  def permission_scope_from_permissions_params(params)
    parent_param = params[:parent_param]
    scope_id = params[parent_param]
    case parent_param
    when nil
      nil
    when :project_id
      Project.find(scope_id)
    when :phase_id
      Phase.find(scope_id)
    when :idea_id
      idea = Idea.find(scope_id)
      ParticipationContextService.new.get_participation_context idea.project
    end
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

  def denied_reason(permission, user)
    if permission.permitted_by == 'everyone'
      user ||= User.new
    else
      return DENIED_REASONS[:not_signed_in] if !user
      return DENIED_REASONS[:blocked] if user.blocked?

      if !user.confirmation_required? # Ignore confirmation as this will be checked by the requirements
        return DENIED_REASONS[:not_active] if !user.active?
        return if UserRoleService.new.can_moderate? permission.permission_scope, user
        return DENIED_REASONS[:not_permitted] if permission.permitted_by == 'admins_moderators'

        if permission.permitted_by == 'groups'
          reason = denied_when_permitted_by_groups?(permission, user)
          return DENIED_REASONS[reason] if reason.present?
        end
      end
    end
    return if requirements(permission, user)[:permitted]

    DENIED_REASONS[:missing_data]
  end

  def denied_when_permitted_by_groups?(permission, user)
    :not_in_group if !user.in_any_groups?(permission.groups)
  end

  def base_requirements(permission)
    everyone = {
      built_in: {
        first_name: 'dont_ask',
        last_name: 'dont_ask',
        email: 'dont_ask'
      },
      custom_fields: requirements_fields(permission).to_h { |field| [field.key, 'dont_ask'] },
      onboarding: { topics_and_areas: 'dont_ask' },
      special: {
        password: 'dont_ask',
        confirmation: 'dont_ask',
        verification: 'dont_ask',
        group_membership: 'dont_ask'
      }
    }

    everyone_confirmed_email = everyone.deep_dup.tap do |requirements|
      requirements[:built_in][:email] = 'require'
      requirements[:custom_fields] = requirements_fields(permission).to_h { |field| [field.key, (field.required ? 'require' : 'ask')] }
      requirements[:special][:confirmation] = 'require' if AppConfiguration.instance.feature_activated?('user_confirmation')
    end

    users = everyone_confirmed_email.deep_dup.tap do |requirements|
      requirements[:built_in][:first_name] = 'require'
      requirements[:built_in][:last_name] = 'require'
      requirements[:onboarding].transform_values! { 'ask' } if onboarding_possible?
      requirements[:special][:password] = 'require'
    end

    groups = users.deep_dup.tap do |requirements|
      requirements[:special][:group_membership] = 'require'
    end

    case permission.permitted_by
    when 'everyone'
      everyone
    when 'everyone_confirmed_email'
      AppConfiguration.instance.feature_activated?('user_confirmation') ? everyone_confirmed_email : users
    when 'groups'
      groups
    else # users | admins_moderators'
      users
    end
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements if !user

    requirements[:built_in]&.each_key do |attribute|
      requirements[:built_in][attribute] = 'satisfied' if !user.send(attribute).nil?
    end
    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields][key] = 'satisfied' if user.custom_field_values.key?(key)
    end
    %w[topics_and_areas].each do |onboarding_key|
      requirements[:onboarding][onboarding_key] = 'satisfied' if user.onboarding[onboarding_key] == 'satisfied'
    end
    requirements[:special]&.each_key do |special_key|
      is_satisfied = case special_key
      when :password
        !user.no_password?
      when :confirmation
        !user.confirmation_required?
      when :group_membership
        user.in_any_groups?(permission.groups)
      end
      requirements[:special][special_key] = 'satisfied' if is_satisfied
    end
  end

  def onboarding_possible?
    app_configuration.settings.dig('core', 'onboarding') && (
      Topic.where(include_in_onboarding: true).count > 0 || Area.where(include_in_onboarding: true).count > 0
    )
  end

  def ignore_password_for_sso!(requirements, user)
    return requirements if !user

    requirements[:special][:password] = 'dont_ask' if user.sso?
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end
end

PermissionsService.prepend(Verification::Patches::PermissionsService)
