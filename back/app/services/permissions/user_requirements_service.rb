# frozen_string_literal: true

class Permissions::UserRequirementsService
  def initialize(check_groups: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups = check_groups
  end

  def requirements(permission, user)
    requirements = custom_permitted_by_enabled? ? base_requirements_new(permission) : base_requirements(permission)
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

  def requirements_custom_fields(permission)
    if permission.global_custom_fields && !custom_permitted_by_enabled?
      registration_fields
    else
      permission.permissions_fields.where(field_type: 'custom_field').map do |permissions_field|
        permissions_field.custom_field.tap do |field|
          field.enabled = true # Need to override this to ensure it gets displayed when not enabled at platform level
          field.required = permissions_field.required
        end
      end
    end
  end

  # This method is overridden in the Verification engine
  def requires_verification?(_permission, _user)
    false
  end

  private

  def base_requirements_template(permission)
    {
      built_in: {
        first_name: 'dont_ask',
        last_name: 'dont_ask',
        email: 'dont_ask'
      },
      custom_fields: requirements_custom_fields(permission).to_h { |field| [field.key, 'dont_ask'] },
      onboarding: { topics_and_areas: 'dont_ask' },
      special: {
        password: 'dont_ask',
        confirmation: 'dont_ask',
        verification: 'dont_ask',
        group_membership: 'dont_ask'
      }
    }
  end

  def base_requirements(permission)
    everyone = base_requirements_template(permission)

    everyone_confirmed_email = everyone.deep_dup.tap do |requirements|
      requirements[:built_in][:email] = 'require'
      requirements[:custom_fields] = requirements_custom_fields(permission).to_h { |field| [field.key, (field.required ? 'require' : 'ask')] }
      requirements[:special][:confirmation] = 'require' if app_configuration.feature_activated?('user_confirmation')
    end

    users = everyone_confirmed_email.deep_dup.tap do |requirements|
      requirements[:built_in][:first_name] = 'require'
      requirements[:built_in][:last_name] = 'require'
      requirements[:onboarding].transform_values! { 'ask' } if onboarding_possible?
      requirements[:special][:password] = 'require'
    end

    groups = users.deep_dup.tap do |requirements|
      requirements[:special][:group_membership] = 'require' if @check_groups
    end

    case permission.permitted_by
    when 'everyone'
      everyone
    when 'everyone_confirmed_email'
      if permission.action == 'following'
        app_configuration.feature_activated?('user_confirmation') && app_configuration.feature_activated?('password_login') ? everyone_confirmed_email : users
      else
        app_configuration.feature_activated?('user_confirmation') ? everyone_confirmed_email : users
      end
    when 'groups'
      groups
    else # users | admins_moderators'
      users
    end
  end

  # Requirements driven by the new permissions fields (currently feature flagged)
  def base_requirements_new(permission)
    base = base_requirements_template(permission)
    return base if permission.permitted_by == 'everyone'

    email_field = permission.permissions_fields.find_by(field_type: 'email')
    name_field = permission.permissions_fields.find_by(field_type: 'name')

    base.deep_dup.tap do |requirements|
      requirements[:built_in][:first_name] = name_field.enabled ? 'require' : 'dont_ask'
      requirements[:built_in][:last_name] = name_field.enabled ? 'require' : 'dont_ask'
      requirements[:built_in][:email] = email_field.enabled ? 'require' : 'dont_ask'

      if email_field.enabled
        requirements[:special][:password] = 'require' if email_field.config['password']
        requirements[:special][:confirmation] = 'require' if email_field.config['confirmed'] && app_configuration.feature_activated?('user_confirmation')
      end

      requirements[:custom_fields] = requirements_custom_fields(permission).to_h { |field| [field.key, (field.required ? 'require' : 'ask')] }

      requirements[:special][:group_membership] = 'require' if @check_groups && permission.permitted_by == 'custom' && permission.groups.present?

      # TODO: JS - will need changing when onboarding is implemented as a permissions_field
      requirements[:onboarding].transform_values! { 'ask' } if (permission.permitted_by == 'users' || permission.permitted_by == 'admins_moderators') && onboarding_possible?

      # TODO: JS - implement verification
    end
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements unless user

    requirements[:built_in]&.each_key do |attribute|
      requirements[:built_in][attribute] = 'satisfied' unless user.send(attribute).nil?
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
        permission.groups.present? && user.in_any_groups?(permission.groups)
      end
      requirements[:special][special_key] = 'satisfied' if is_satisfied
    end
  end

  def onboarding_possible?
    return @onboarding_possible unless @onboarding_possible.nil?

    @onboarding_possible = app_configuration.settings.dig('core', 'onboarding') && (!Topic.where(include_in_onboarding: true).empty? || !Area.where(include_in_onboarding: true).empty?)
  end

  def ignore_password_for_sso!(requirements, user)
    return requirements unless user

    requirements[:special][:password] = 'dont_ask' if user.sso?
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def registration_fields
    @registration_fields ||= CustomField.registration.enabled.order(:ordering)
  end

  def custom_permitted_by_enabled?
    @custom_permitted_by_enabled ||= app_configuration.feature_activated?('custom_permitted_by')
  end
end

Permissions::UserRequirementsService.prepend(Verification::Patches::Permissions::UserRequirementsService)
