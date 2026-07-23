# frozen_string_literal: true

class Permissions::UserRequirementsService
  MIN_VERIFICATION_EXPIRY = 30.minutes
  # Email/phone confirmation expiry mirrors verification expiry: an expiry of 0
  # is a testing shortcut that maps to this minimum instead of "0 days ago" (which
  # would demand re-confirmation on every single request).
  MIN_CONFIRMED_EMAIL_EXPIRY = 30.minutes
  MIN_CONFIRMED_PHONE_NUMBER_EXPIRY = 30.minutes

  def initialize(check_groups_and_verification: true)
    # This allows us to ignore groups when calling from within PermissionsService where groups are separately checked
    @check_groups_and_verification = check_groups_and_verification
  end

  def requirements(permission, user)
    return empty_requirements(permission) if phase_moderator_bypass?(permission, user)

    build_requirements(permission, user)
  end

  def permitted?(requirements)
    authentication = requirements[:authentication]
    return false if authentication[:missing_user_attributes].any?
    return false if authentication[:email_action_required]
    return false if authentication[:phone_action_required]
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

  # Whether an already-confirmed email/phone must be confirmed *again* because the
  # permission sets an expiry and that window has elapsed since it was last
  # confirmed. Returns false when no expiry is configured, or when it was never
  # confirmed (confirmed_at nil) — first-time confirmation is handled by the
  # callers (#email_action_required / #phone_action_required). An expiry of 0 is a
  # testing shortcut that maps to the minimum window instead of "0 days ago"
  # (which would demand re-confirmation on every single request).
  def reconfirmation_required?(expiry_days, confirmed_at, min_expiry)
    return false if expiry_days.nil?
    return false if confirmed_at.nil?

    offset = expiry_days.zero? ? min_expiry : expiry_days.days
    (confirmed_at + offset) < Time.current
  end

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
    add_email_and_phone_actions! requirements, permission, user
    requirements
  end

  # Requirements for a user who bypasses every participation gate (a moderator
  # of the phase or an admin): nothing is missing and nothing is required.
  def empty_requirements(permission)
    {
      authentication: {
        permitted_by: permission.permitted_by,
        missing_user_attributes: [],
        email_action_required: nil,
        phone_action_required: nil
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
        missing_user_attributes: base_missing_user_attributes(permission),
        email_action_required: nil,
        phone_action_required: nil
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

  # The built-in profile attributes a user needs to provide, derived from the
  # permission's require_* flags. Only the name and password live here now; the
  # email and phone number (and their confirmation state) are expressed
  # separately through :email_action_required / :phone_action_required, because
  # they are not a simple "is this field filled in?" checkoff — the required
  # action depends on where the value lives (email vs new_email) and how it must
  # be confirmed. See #email_action_required / #phone_action_required.
  def base_missing_user_attributes(permission)
    attributes = []
    attributes.push(:first_name, :last_name) if permission.require_name
    attributes.push(:password) if permission.require_password

    attributes
  end

  def mark_satisfied_requirements!(requirements, permission, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes].excluding(:password).each do |attribute|
      requirements[:authentication][:missing_user_attributes].delete(attribute) unless user.send(attribute).nil?
    end
    requirements[:authentication][:missing_user_attributes].delete(:password) unless user.password_digest.nil?

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

  # For a user who signed up via SSO (i.e. has a linked identity), we NEVER ask
  # for a password, even when the permission has require_password enabled. In
  # other words, require_password is effectively ignored for SSO sign-ups.
  #
  # This is admittedly a little weird - you would expect require_password to be
  # honoured regardless of how the account was created - but it is intentional
  # for now. In practice, 9 times out of 10, an admin who configures an SSO login
  # method does NOT want to additionally prompt those users to pick a password.
  # If we honoured require_password here it would be far too easy for an admin to
  # overlook the setting and accidentally leave it enabled, forcing an unwanted
  # password step onto every SSO user. So we drop the password requirement for
  # SSO users unconditionally. See the SSO specs in user_requirements_service_spec.rb.
  def ignore_password_for_sso!(requirements, user)
    return requirements unless user

    requirements[:authentication][:missing_user_attributes].delete(:password) if user.sso?
  end

  # Sets the email/phone action a user still has to complete. These are a
  # derived state over the whole (permission, user) tuple rather than a
  # base-list-minus-satisfied checkoff, so they are computed directly here after
  # the list-based requirements have been resolved. 'everyone' permissions never
  # require an account, so no action is ever asked of them.
  def add_email_and_phone_actions!(requirements, permission, user)
    authentication = requirements[:authentication]
    if permission.permitted_by == 'everyone'
      authentication[:email_action_required] = nil
      authentication[:phone_action_required] = nil
    else
      authentication[:email_action_required] = email_action_required(permission, user)
      authentication[:phone_action_required] = phone_action_required(permission, user)
    end
  end

  # The email step a user must still complete for this permission, or nil when
  # their email requirement is already satisfied (or not required at all).
  #
  # - :provide_email      no account yet — provide an email (stored in `email`)
  #                       and confirm it in place (EmailConfirmation).
  # - :confirm_email      an account with a never-confirmed `email` — confirm it
  #                       in place (EmailConfirmation).
  # - :reconfirm_email    an account whose `email` was confirmed before but has
  #                       aged past confirmed_email_expiry — confirm it again. This
  #                       resolves to exactly the same step and endpoints as
  #                       :confirm_email server-side; the distinct value only tells
  #                       the frontend that no code was auto-sent (unlike first-time
  #                       confirmation, which sends from SideFxUserService#after_create),
  #                       so it must request one. See #reconfirmation_required?.
  # - :provide_new_email  an account with no email at all (e.g. an SSO sign-up
  #                       that returned no email) — provide one via `new_email`.
  # - :confirm_new_email  an account with a pending `new_email` (e.g. an SSO
  #                       sign-up with an unconfirmed email) — confirm it
  #                       (NewEmailConfirmation), which promotes it to `email`.
  #
  # A user who already has a confirmed `email` and separately started an email
  # *change* (so `email` is present AND `new_email` is pending) is not forced
  # through that change here: the `email` branch is checked first and returns nil.
  def email_action_required(permission, user)
    return nil unless permission.require_confirmed_email
    return :provide_email if user.nil?

    if user.email.present?
      if user.confirmation_required?
        :confirm_email
      elsif reconfirmation_required?(permission.confirmed_email_expiry, user.email_confirmed_at, MIN_CONFIRMED_EMAIL_EXPIRY)
        :reconfirm_email
      end
    elsif user.new_email.present?
      :confirm_new_email
    else
      :provide_new_email
    end
  end

  # The phone step a user must still complete for this permission, or nil when
  # their phone requirement is already satisfied (or not required at all).
  #
  # Unlike email, a phone can never be provided before an account exists and is
  # only ever confirmed via the new_phone -> phone promotion (there is no
  # in-place phone confirmation).
  #
  # - :provide_new_phone  no phone yet — provide one via `new_phone`.
  # - :confirm_new_phone  a pending `new_phone` — confirm it (NewPhoneConfirmation),
  #                       which promotes it to `phone`.
  # - :confirm_phone      an existing `phone` that was never confirmed.
  # - :reconfirm_phone    an existing `phone` that was confirmed before but has
  #                       aged past confirmed_phone_number_expiry. Mirrors
  #                       :reconfirm_email: the distinct value signals the frontend
  #                       to (re)send a code. See #reconfirmation_required?.
  def phone_action_required(permission, user)
    return nil unless permission.require_confirmed_phone_number
    return :provide_new_phone if user.nil?

    if user.phone.present?
      if user.phone_confirmed_at.nil?
        :confirm_phone
      elsif reconfirmation_required?(permission.confirmed_phone_number_expiry, user.phone_confirmed_at, MIN_CONFIRMED_PHONE_NUMBER_EXPIRY)
        :reconfirm_phone
      end
    elsif user.new_phone.present?
      :confirm_new_phone
    else
      :provide_new_phone
    end
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
