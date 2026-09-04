# frozen_string_literal: true

class ExpireConfirmationCodeOrDeleteJob < ApplicationJob
  # The type is enqueued as a class name; only these five are expected.
  ASSOCIATION_NAMES = {
    'EmailConfirmation' => :email_confirmation,
    'NewEmailConfirmation' => :new_email_confirmation,
    'PhoneConfirmation' => :phone_confirmation,
    'NewPhoneConfirmation' => :new_phone_confirmation,
    'MergeAccountConfirmation' => :merge_account_confirmation
  }.freeze

  # The signup flows: the code is the user's only way to prove they own the identity
  # they registered with, so an expired code means the signup never completed. The
  # new_* flows change an identity on an already-existing user and never delete.
  # Nor does the merge flow: its user is a real signed-in SSO account that exists
  # perfectly well on its own if the merge is abandoned.
  SIGNUP_ASSOCIATION_NAMES = %i[email_confirmation phone_confirmation].freeze

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
    # A password or a completed registration means the user has another way into
    # the account (registration_completed_at is only stamped once the user has
    # authenticated at least once - confirmed email, confirmed phone, or SSO), so
    # for those we only expire the code.
    if SIGNUP_ASSOCIATION_NAMES.include?(association_name) && user.no_password? && !user.registration_completed_at
      DeleteUserJob.perform_later(user)
    end
  end
end
