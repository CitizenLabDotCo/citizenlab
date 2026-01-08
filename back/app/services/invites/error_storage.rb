# frozen_string_literal: true

class Invites::ErrorStorage
  INVITE_ERRORS = {
    unparseable_excel: 'unparseable_excel',
    max_invites_limit_exceeded: 'max_invites_limit_exceeded',
    no_invites_specified: 'no_invites_specified',
    unknown_group: 'unknown_group',
    malformed_admin_value: 'malformed_admin_value',
    malformed_groups_value: 'malformed_groups_value',
    malformed_custom_field_value: 'malformed_custom_field_value',
    unknown_locale: 'unknown_locale',
    invalid_email: 'invalid_email',
    invalid_row: 'invalid_row',
    email_already_invited: 'email_already_invited',
    email_already_active: 'email_already_active',
    emails_duplicate: 'emails_duplicate',
    email_banned: 'email_banned'
  }

  def initialize
    @errors = []
  end

  def add_error(key, options = {})
    @errors << Invites::InviteError.new(INVITE_ERRORS[key], options)
  end

  def ignored_errors
    @errors.select(&:ignore)
  end

  def no_critical_errors?
    @errors.reject(&:ignore).empty?
  end

  def fail_now
    raise Invites::FailedError.new(errors: @errors)
  end
end
