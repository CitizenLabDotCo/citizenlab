# frozen_string_literal: true

class Permissions::UserRequirementsService
  def initialize(check_groups_and_verification: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups_and_verification = check_groups_and_verification
  end

  def requirements(permission, user)
    requirements = base_requirements(permission)
    mark_satisfied_requirements! requirements, permission, user if user
    ignore_password_for_sso! requirements, user if user
    requirements
  end

  def permitted?(requirements)
    return false if requirements[:authentication][:missing_user_attributes].any?
    return false if requirements[:verification]
    return false if requirements[:custom_fields].values.any?('required')
    return false if requirements[:group_membership]

    true
  end

  def permitted_for_permission?(permission, user)
    requirements = requirements(permission, user)
    permitted?(requirements)
  end

  def requirements_custom_fields(permission)
    permissions_custom_fields_service.fields_for_permission(permission).map do |permissions_custom_field|
      permissions_custom_field.custom_field.tap do |field|
        field.enabled = true # Need to override this to ensure it gets displayed when not enabled at platform level
        field.required = permissions_custom_field.required
      end
    end
  end

  # This method is overridden in the Verification engine
  def requires_verification?(_permission, _user)
    false
  end

  private

  def base_requirements(permission)
    users_requirements = {
      authentication: {
        permitted_by: disable_everyone_confirmed_email?(permission) ? 'users' : permission.permitted_by,
        missing_user_attributes: %i[first_name last_name email confirmation password]
      },
      verification: false,
      custom_fields: requirements_custom_fields(permission).to_h { |field| [field.key, (field.required ? 'required' : 'optional')] },
      onboarding: onboarding_possible?,
      group_membership: @check_groups_and_verification && permission.groups.any?
    }

    everyone_confirmed_email_requirements = users_requirements.deep_dup.tap do |requirements|
      requirements[:authentication][:missing_user_attributes] = %i[email confirmation]
      requirements[:onboarding] = false
    end

    everyone_requirements = everyone_confirmed_email_requirements.deep_dup.tap do |requirements|
      requirements[:authentication][:missing_user_attributes] = []
    end

    case permission.permitted_by
    when 'everyone'
      everyone_requirements
    when 'everyone_confirmed_email'
      disable_everyone_confirmed_email?(permission) ? users_requirements : everyone_confirmed_email_requirements
    else # users | groups | verified | admins_moderators
      users_requirements
    end
  end

  def disable_everyone_confirmed_email?(permission)
    return false unless permission.permitted_by == 'everyone_confirmed_email'

    !app_configuration.feature_activated?('user_confirmation') ||
      (permission.action == 'following' && !app_configuration.feature_activated?('password_login'))
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes].excluding(%i[confirmation password])&.each do |attribute|
      requirements[:authentication][:missing_user_attributes].delete(attribute) unless user.send(attribute).nil?
    end
    requirements[:authentication][:missing_user_attributes].delete(:password) unless user.password_digest.nil?
    requirements[:authentication][:missing_user_attributes].delete(:confirmation) unless user.confirmation_required?

    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields].delete(key) if user.custom_field_values.key?(key)
    end

    if requirements[:onboarding]
      requirements[:onboarding] = user.onboarding['topics_and_areas'] != 'satisfied'
    end

    if requirements[:group_membership]
      requirements[:group_membership] = !user.in_any_groups?(permission.groups)
    end
  end

  def onboarding_possible?
    return @onboarding_possible unless @onboarding_possible.nil?

    @onboarding_possible = app_configuration.settings.dig('core', 'onboarding') && (!Topic.where(include_in_onboarding: true).empty? || !Area.where(include_in_onboarding: true).empty?)
  end

  def ignore_password_for_sso!(requirements, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes].delete(:password) if user.sso?
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def registration_fields
    @registration_fields ||= CustomField.registration.enabled.order(:ordering)
  end

  def permissions_custom_fields_service
    @permissions_custom_fields_service ||= Permissions::PermissionsCustomFieldsService.new
  end
end

Permissions::UserRequirementsService.prepend(Verification::Patches::Permissions::UserRequirementsService)
