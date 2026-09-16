# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  # The type is enqueued as a class name; only these four are expected.
  ASSOCIATION_NAMES = {
    'EmailConfirmation' => :email_confirmation,
    'NewEmailConfirmation' => :new_email_confirmation,
    'PhoneConfirmation' => :phone_confirmation,
    'NewPhoneConfirmation' => :new_phone_confirmation
  }.freeze

  # The signup flows: the code is the user's only way to prove they own the identity
  # they registered with, so an expired code means the signup never completed. The
  # new_* flows change an identity on an already-existing user and never delete.
  SIGNUP_ASSOCIATION_NAMES = %i[email_confirmation phone_confirmation].freeze

  def run(user_id, confirmation_type, code_to_expire)
    user = User.find_by(id: user_id)
    return unless user

    association_name = ASSOCIATION_NAMES[confirmation_type]
    return unless association_name

    confirmation = user.public_send(association_name)
    return unless confirmation
    return unless user.confirmation_pending?(association_name)
    return unless expire_code_if_current(confirmation, code_to_expire)

    # Garbage-collect freshly-signed-up users who never finished confirming.
    # A password or a completed registration means the user has another way into
    # the account (registration_completed_at is only stamped once the user has
    # authenticated at least once - confirmed email, confirmed phone, or SSO), so
    # for those we only expire the code.
    if SIGNUP_ASSOCIATION_NAMES.include?(association_name) && user.no_password? && !user.registration_completed_at
      DeleteUserJob.perform_later(user)
    end
  end

  private

  # Compares and clears under a row lock. Otherwise a new code issued between
  # the comparison and the write (a resend right as the old code expires) would
  # be wiped before the user could use it. The lock reloads the row, so the
  # comparison sees a committed resend, and a resend that starts afterwards
  # waits for the lock and then writes its code over the cleared one.
  def expire_code_if_current(confirmation, code_to_expire)
    expired = false
    confirmation.with_lock do
      if confirmation.code == code_to_expire
        confirmation.expire_code!
        expired = true
      end
    end
    expired
  rescue ActiveRecord::RecordNotFound
    false # consumed (confirmed, or cancelled by another user's change) in the meantime
  end
end
