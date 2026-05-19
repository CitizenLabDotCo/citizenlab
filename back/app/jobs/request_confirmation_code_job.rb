# frozen_string_literal: true

class RequestConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  attr_reader :user

  def run(user, new_email: nil)
    @user = user

    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })

    ActiveRecord::Base.transaction do
      confirmation = prepare_confirmation(user, new_email)
      confirmation.reset_code!
      deliver_confirmation_code!(confirmation)
      schedule_code_expiration!(user, confirmation)
      LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })
    end
  end

  private

  def prepare_confirmation(user, new_email)
    if new_email
      user.update!(new_email: new_email)
      user.new_email_confirmation
    else
      # Requesting a code on the email-confirmation flow always re-arms the
      # user's confirmation gate. This matters for legacy passwordless users
      # who already confirmed once but need a fresh code to log back in.
      user.update!(confirmation_required: true) unless user.confirmation_required
      user.email_confirmation
    end
  end

  def deliver_confirmation_code!(confirmation)
    ConfirmationsMailer.with(user: confirmation.user).send_confirmation_code.deliver_now
    confirmation.update!(code_sent_at: Time.zone.now)
  end

  def schedule_code_expiration!(user, confirmation)
    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: confirmation.expiration_at
    ).perform_later(
      user.id,
      confirmation.class.name,
      confirmation.code
    )
  end
end
