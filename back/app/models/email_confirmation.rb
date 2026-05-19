# frozen_string_literal: true

class EmailConfirmation < Confirmation
  # True if the user has not yet confirmed their email address.
  #
  # Exception: if the user registered via SSO and the SSO did not return an email,
  # we treat them as not requiring confirmation unless they have actively requested
  # to set an email.
  def required?
    return false if sso_user_without_email?

    user.confirmation_required
  end

  def confirm!
    return false unless required?

    transaction do
      user.update!(email_confirmed_at: Time.zone.now, confirmation_required: false)
      clear_code!
      cancel_other_users_pending_email_change(user.email) if user.email.present?
    end
    true
  end

  private

  def sso_user_without_email?
    user.sso? && user.verified && user.email.nil? && user.new_email.nil?
  end
end
