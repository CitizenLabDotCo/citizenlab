# frozen_string_literal: true

class Permissions::UserRequirementsService
  def initialize(check_groups: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups = check_groups
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
      registration_fields
    else
      permission.permissions_custom_fields.map do |permissions_custom_field|
        permissions_custom_field.custom_field.tap do |field|
          field.enabled = true # Need to overide this to ensure it gets displayed when not enabled at platform level
          field.required = permissions_custom_field.required
        end
      end
    end
  end

  # This method is overridden in the Verification engine
  def requires_verification?(_permission, _user)
    false
  end

  private

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

    @onboarding_possible = app_configuration.settings.dig('core', 'onboarding') && (Topic.where(include_in_onboarding: true).count > 0 || Area.where(include_in_onboarding: true).count > 0)
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
end

Permissions::UserRequirementsService.prepend(Verification::Patches::Permissions::UserRequirementsService)
