# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  # The type is enqueued as a class name; only these four are expected.
  ASSOCIATION_NAMES = {
    'EmailConfirmation' => :email_confirmation,
    'NewEmailConfirmation' => :new_email_confirmation,
    'PhoneConfirmation' => :phone_confirmation,
    'NewPhoneConfirmation' => :new_phone_confirmation
  }.freeze

  def run(user_id, confirmation_type, code_to_expire)
    user = User.find_by(id: user_id)
    return unless user

    association_name = ASSOCIATION_NAMES[confirmation_type]
    return unless association_name

    confirmation = user.public_send(association_name)
    return unless confirmation
    return unless confirmation.code == code_to_expire
    return unless user.confirmation_pending?(association_name)

    confirmation.expire_code!

    # Garbage-collect freshly-signed-up users who never finished confirming.
    # Only applies to the email-confirmation (signup) flow.
    if association_name == :email_confirmation && user.no_password? && !user.registration_completed_at
      DeleteUserJob.perform_later(user)
    end
  end
end
