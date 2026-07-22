# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  # Guards a request for an in-place email confirmation code (the
  # request_code_email action). `record` is the User found by the submitted email
  # (may be nil); `user` is current_user (nil for unauthenticated callers, since
  # the action skips authenticate_user). There are two legitimate callers:
  #
  #   1. Unauthenticated: someone signing up with email or logging in as a
  #      passwordless user. They must NOT already be a fully-fledged account
  #      (password set AND email confirmed) — such an account has no reason to
  #      request an in-place confirmation code from the public flow, so we reject
  #      it to avoid handing out codes for arbitrary existing accounts.
  #
  #   2. Authenticated re-confirmation: a logged-in user whose confirmed email has
  #      aged past the permission's confirmed_email_expiry and must confirm it
  #      again. This user DOES have a password and IS already confirmed
  #      (confirmation_required? == false), so guard (1) would wrongly reject them.
  #      We allow it precisely when the requester is the authenticated owner of the
  #      email (user == record), before that guard runs.
  def request_code_email?
    return false unless app_configuration.feature_activated?('password_login')
    return false if record.nil?
    return false if record.email.blank?

    # Caller (2): an authenticated user requesting a (re)confirmation code for
    # their own email. Skips the "already a full account" guard below, which only
    # exists to protect the unauthenticated flow.
    if !user && !user == record && (record.password_digest? && !record.confirmation_required?)
      return false
    end

    return false if record.email_confirmation.code_reset_count >= max_retries - 1

    true
  end

  # For authenticated users changing their email
  def request_code_new_email?
    return false if user.nil?
    return false if user.new_email_confirmation.code_reset_count >= max_retries - 1

    true
  end

  # For authenticated users adding/changing their phone number
  def request_code_new_phone?
    return false unless app_configuration.feature_activated?('sms')
    return false if user.nil?
    return false if user.new_phone_confirmation.code_reset_count >= max_retries - 1

    true
  end

  private

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def max_retries
    ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
