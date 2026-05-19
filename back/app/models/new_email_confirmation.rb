# frozen_string_literal: true

class NewEmailConfirmation < Confirmation
  # Promotes new_email -> email on the user, marks the email confirmed,
  # and clears this confirmation's code state.
  def confirm!
    return false if user.new_email.blank?

    new_email = user.new_email
    transaction do
      user.update!(
        email: new_email,
        new_email: nil,
        email_confirmed_at: Time.zone.now,
        confirmation_required: false
      )
      clear_code!
      cancel_other_users_pending_email_change(new_email)
    end
    true
  end
end
