# frozen_string_literal: true

class RequestConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, new_email: nil)
    # TODO: add user reader attr
    raise 'Confirmation is currently working for emails only.' if !user.registered_with_email?

    # TODO: log activity
    old_email = user.email
    begin
      user.reset_email! new_email if new_email
      reset_user_confirmation_code user
      deliver_confirmation_code user
      schedule_code_expiration user
    rescue StandardError => e
      user.update!(email: old_email) if new_email && old_email # TODO: use transaction instead?
      ErrorReporter.report e
      raise e
    end
  end

  private

  def reset_user_confirmation_code(user)
    first_code = user.email_confirmation_code.nil?
    user.reset_confirmation_code
    user.increment_confirmation_code_reset_count! if !first_code
    user.save!
  end

  def deliver_confirmation_code(user)
    ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_now
    user.update!(email_confirmation_code_sent_at: Time.zone.now)
  end

  def schedule_code_expiration(user)
    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: user.email_confirmation_code_expiration_at
    ).perform_later(
      user.id,
      user.email_confirmation_code
    )
  end
end
