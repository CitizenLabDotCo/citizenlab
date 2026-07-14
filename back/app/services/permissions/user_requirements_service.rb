# frozen_string_literal: true

class Permissions::UserRequirementsService
  MIN_VERIFICATION_EXPIRY = 30.minutes

  def initialize(check_groups_and_verification: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups_and_verification = check_groups_and_verification
  end

  def requirements(permission, user)
    return empty_requirements(permission) if phase_moderator_bypass?(permission, user)

    build_requirements(permission, user)
  end

  def permitted?(requirements)
    return false if requirements[:authentication][:missing_user_attributes].any?
    return false if requirements[:verification]
    return false if requirements[:custom_fields].values.any?('required')
    return false if requirements[:group_membership]

    true
  end

  def permitted_for_permission?(permission, user)
    # Only reached from BasePermissionsService#user_denied_reason, *after* its
    # own can_moderate? short-circuit — so the user is never a moderator here.
    # Build the requirements directly to skip re-running that check, which would
    # otherwise add a role lookup per permission on hot paths (e.g. the
    # admin_publications index).
    permitted?(build_requirements(permission, user))
  end

  def requirements_custom_fields(permission)
    fields = permissions_custom_fields_service.fields_for_permission(permission).map do |permissions_custom_field|
      permissions_custom_field.custom_field.tap do |field|
        field.enabled = true # Need to override this to ensure it gets displayed when not enabled at platform level
        field.required = permissions_custom_field.required
      end
    end

    fields.reject(&:hidden?) # Should not return hidden fields
  end

  # Verification requirement can now come from either a group or the require_verification attribute
  def requires_verification?(permission, user)
    if permission.require_verification
      # Only check requirements for when we require verification again if require_verification is set
      if !permission.verification_expiry.nil? && user.verifications.present?
        expiry_offset = permission.verification_expiry == 0 ? MIN_VERIFICATION_EXPIRY : permission.verification_expiry.days
        last_verification_time = user.verifications.last&.updated_at
        next_verification_time = last_verification_time + expiry_offset
        return next_verification_time < Time.now
      end
    else
      # Verification via groups
      return false if unverified_user_allowed_through_other_groups?(permission, user) # if the user meets the requirements of any other group we don't need to ask for verification
      return false unless verification_service.find_verification_group(permission.groups)
    end

    !user.verified?
  end

  private

  # A confirmed, active moderator of the phase (or an admin) bypasses every
  # participation gate, so all their requirements are satisfied. This mirrors
  # denied_reason_for_action, which short-circuits on can_moderate? — but only
  # after the blocked / unconfirmed / inactive checks — so we apply those same
  # guards here. Otherwise the requirements response could contradict the
  # permission check (e.g. group_membership: true with a nil disabled_reason),
  # wrongly blocking a moderator in the auth flow — or let an unconfirmed admin
  # skip confirmation.
  def phase_moderator_bypass?(permission, user)
    user && !user.blocked? && !user.confirmation_required? && user.active? &&
      permission.permission_scope_type == 'Phase' &&
      UserRoleService.new.can_moderate?(permission.permission_scope, user)
  end

  def build_requirements(permission, user)
    requirements = base_requirements(permission)
    mark_satisfied_requirements! requirements, permission, user if user
    ignore_password_for_sso! requirements, user if user
    requirements
  end

  # Requirements for a user who bypasses every participation gate (a moderator
  # of the phase or an admin): nothing is missing and nothing is required.
  def empty_requirements(permission)
    {
      authentication: {
        permitted_by: permission.permitted_by,
        missing_user_attributes: []
      },
      verification: false,
      custom_fields: {},
      onboarding: false,
      group_membership: false
    }
  end

  def base_requirements(permission)
    users_requirements = {
      authentication: {
        permitted_by: permission.permitted_by,
        missing_user_attributes: base_missing_user_attributes(permission)
      },
      verification: false,
      custom_fields: {},
      onboarding: onboarding_possible?,
      group_membership: @check_groups_and_verification && permission.groups.any?
    }

    unless permission.user_fields_in_form_enabled?
      users_requirements[:custom_fields] = requirements_custom_fields(permission).to_h { |field| [field.key, (field.required ? 'required' : 'optional')] }
    end

    everyone_requirements = users_requirements.deep_dup.tap do |requirements|
      requirements[:authentication][:missing_user_attributes] = []
      requirements[:onboarding] = false
    end

    requirements = case permission.permitted_by
    when 'everyone'
      everyone_requirements
    else # users | admins_moderators
      users_requirements
    end

    if @check_groups_and_verification && permission.verification_enabled?
      requirements[:verification] = true
    end
    requirements
  end

  # The attributes a user needs to provide, derived from the permission's
  # require_* flags. An email (and thus an account) is always required for a
  # non-"everyone" permission; the name, confirmation, password and phone number
  # (with its confirmation) are only required when their respective flag is set.
  def base_missing_user_attributes(permission)
    attributes = %i[first_name last_name email confirmation password]
    attributes -= %i[first_name last_name] unless permission.require_name
    attributes.delete(:confirmation) unless permission.require_confirmed_email
    attributes.delete(:password) unless permission.require_password
    attributes += %i[phone phone_confirmation] if permission.require_confirmed_phone_number
    attributes
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes].excluding(%i[confirmation password phone_confirmation])&.each do |attribute|
      requirements[:authentication][:missing_user_attributes].delete(attribute) unless user.send(attribute).nil?
    end
    requirements[:authentication][:missing_user_attributes].delete(:password) unless user.password_digest.nil?
    requirements[:authentication][:missing_user_attributes].delete(:confirmation) unless permission.require_confirmed_email && user.confirmation_required?
    requirements[:authentication][:missing_user_attributes].delete(:phone_confirmation) unless user.phone_confirmed_at.nil?

    requirements[:custom_fields]&.each_key do |key|
      requirements[:custom_fields].delete(key) if user.custom_field_values.key?(key)
    end

    if requirements[:onboarding]
      requirements[:onboarding] = user.onboarding['topics_and_areas'] != 'satisfied'
    end

    if requirements[:group_membership]
      requirements[:group_membership] = !user.in_any_groups?(permission.groups)
    end

    if user.verified?
      # Remove custom fields that are locked - we should never ask them to be filled in the flow - even if they are returned empty
      locked_fields = verification_service.locked_custom_fields(user)

      requirements[:custom_fields]&.each_key do |key|
        requirements[:custom_fields].delete(key) if locked_fields.include?(key.to_sym)
      end
    end

    return unless requirements[:verification]

    requirements[:verification] = requires_verification?(permission, user)
  end

  # User can be in other groups that are not verification groups and therefore not need to be verified
  def unverified_user_allowed_through_other_groups?(permission, user)
    return false unless permission.groups.any?

    # Remove the verification group from the list of groups
    groups = permission.groups.to_a
    groups.delete(verification_service.find_verification_group(groups))
    return false unless groups.any?

    user.in_any_groups?(groups)
  end

  def onboarding_possible?
    return @onboarding_possible unless @onboarding_possible.nil?

    @onboarding_possible = app_configuration.settings.dig('core', 'onboarding') && (!GlobalTopic.where(include_in_onboarding: true).empty? || !Area.where(include_in_onboarding: true).empty?)
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

  def verification_service
    @verification_service ||= Verification::VerificationService.new
  end
end
