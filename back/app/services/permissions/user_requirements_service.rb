# frozen_string_literal: true

class Permissions::UserRequirementsService
  def initialize(check_groups: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups = check_groups
  end

  def requirements(permission, user)
    requirements = base_requirements(permission)
    mark_satisfied_requirements! requirements, permission, user if user
    ignore_password_for_sso! requirements, user if user
    requirements
  end

  def permitted?(requirements)
    return false if requirements[:authentication][:missing_user_attributes].any?
    return false if requirements[:require_verification]
    # return false if requirements[:custom_fields].values.any? { |value| value == 'required' }
    return false if requirements[:show_onboarding]
    return false if requirements[:group_membership]

    true
  end

  def requirements_custom_fields(permission)
    permissions_fields_service.fields_for_permission(permission).map do |permissions_field|
      permissions_field.custom_field.tap do |field|
        field.enabled = true # Need to override this to ensure it gets displayed when not enabled at platform level
        field.required = permissions_field.required
      end
    end
  end

  # This method is overridden in the Verification engine
  def requires_verification?(_permission, _user)
    false
  end

  private

  def base_requirements_template(permission)
    # {
    #   built_in: {
    #     first_name: 'dont_ask',
    #     last_name: 'dont_ask',
    #     email: 'dont_ask'
    #   },
    #   custom_fields: requirements_custom_fields(permission).to_h { |field| [field.key, 'dont_ask'] },
    #   onboarding: { topics_and_areas: 'dont_ask' },
    #   special: {
    #     password: 'dont_ask',
    #     confirmation: 'dont_ask',
    #     verification: 'dont_ask',
    #     group_membership: 'dont_ask'
    #   }
    # }

  end

  def base_requirements(permission)
    users_requirements = {
      authentication: {
        permitted_by: permission.permitted_by,
        missing_user_attributes: [:first_name, :last_name, :email, :confirmation, :password]
      },
      require_verification: false,
      custom_fields: requirements_custom_fields(permission).to_h { |field| [field.key, (field.required ? 'required' : 'optional')] },
      show_onboarding: onboarding_possible?,
      group_membership: @check_groups && permission.groups.any?
    }

    everyone_confirmed_email_requirements = users_requirements.deep_dup.tap do |requirements|
      requirements[:authentication][:missing_user_attributes] = [:email, :confirmation]
      requirements[:show_onboarding] = false
    end

    everyone_requirements = everyone_confirmed_email_requirements.deep_dup.tap do |requirements|
      requirements[:authentication][:missing_user_attributes] = []
    end

    case permission.permitted_by
    when 'everyone'
      everyone_requirements
    when 'everyone_confirmed_email'
      if permission.action == 'following'
        app_configuration.feature_activated?('user_confirmation') && app_configuration.feature_activated?('password_login') ? everyone_confirmed_email_requirements : users_requirements
      else
        app_configuration.feature_activated?('user_confirmation') ? everyone_confirmed_email_requirements : users_requirements
      end
    else # users | groups | verified | admins_moderators
      users_requirements
    end
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes]&.each do |attribute|
      requirements[:authentication][:missing_user_attributes].delete(attribute) unless user.send(attribute).nil?
    end
    requirements[:authentication][:missing_user_attributes].delete(:confirmation) unless user.confirmation_required?

    # TODO: Delete from array here
    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields][key] = 'satisfied' if user.custom_field_values.key?(key)
    end

    # NOTE: slightly over-designed at the moment as only one type of onboarding is possible at the moment
    if requirements[:onboarding]
      requirements[:onboarding] = %w[topics_and_areas].all? { |onboarding_key| user.onboarding[onboarding_key] == 'satisfied' }
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

    requirements[:special][:password] = 'dont_ask' if user.sso?
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def registration_fields
    @registration_fields ||= CustomField.registration.enabled.order(:ordering)
  end

  def permissions_fields_service
    @permissions_fields_service ||= Permissions::PermissionsFieldsService.new
  end
end

Permissions::UserRequirementsService.prepend(Verification::Patches::Permissions::UserRequirementsService)
