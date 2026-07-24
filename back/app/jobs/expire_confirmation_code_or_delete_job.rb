# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  def run(user_id, confirmation_type, code_to_expire)
    user = User.find_by(id: user_id)
    return unless user

    confirmation = lookup_confirmation(user, confirmation_type)
    return unless confirmation
    return unless confirmation.code == code_to_expire
    return unless confirmation.pending?

    confirmation.expire_code!

    # Garbage-collect freshly-signed-up users who never finished confirming.
    # Only applies to the email-confirmation (signup) flow.
    if confirmation.is_a?(EmailConfirmation) && user.no_password? && !user.registration_completed_at
      DeleteUserJob.perform_later(user)
    end
  end

  private

  def lookup_confirmation(user, type)
    # Non-creating reads: if the confirmation row is gone, there's nothing to
    # expire, so we avoid the lazy find-or-create on `user.*_confirmation`.
    case type
    when 'EmailConfirmation' then user.association(:email_confirmation).reader
    when 'NewEmailConfirmation' then user.association(:new_email_confirmation).reader
    when 'NewPhoneConfirmation' then user.association(:new_phone_confirmation).reader
    end
  end
end
