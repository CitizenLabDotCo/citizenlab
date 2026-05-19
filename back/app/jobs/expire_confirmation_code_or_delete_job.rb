# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  def run(user_id, confirmation_type, code_to_expire)
    user = User.find_by(id: user_id)
    return unless user

    confirmation = lookup_confirmation(user, confirmation_type)
    return unless confirmation
    return unless confirmation.code == code_to_expire
    return unless still_relevant?(user, confirmation)

    confirmation.expire_code!

    # Garbage-collect freshly-signed-up users who never finished confirming.
    # Only applies to the email-confirmation (signup) flow.
    if confirmation.is_a?(EmailConfirmation) && user.no_password? && !user.registration_completed_at
      DeleteUserJob.perform_later(user)
    end
  end

  private

  def lookup_confirmation(user, type)
    case type
    when 'EmailConfirmation' then user.email_confirmation
    when 'NewEmailConfirmation' then user.new_email_confirmation
    end
  end

  def still_relevant?(user, confirmation)
    case confirmation
    when EmailConfirmation then user.confirmation_required?
    when NewEmailConfirmation then user.new_email.present?
    end
  end
end
