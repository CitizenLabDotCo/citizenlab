# frozen_string_literal: true

class RequestConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  attr_reader :user

  def run(user, new_email: nil)
    @user = user
    raise 'User confirmation is disabled.' if !AppConfiguration.instance.feature_activated?('user_confirmation')

    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })

    if new_email
      user.new_email = new_email
    end

    ActiveRecord::Base.transaction do
      user.reset_confirmation_code!
      deliver_confirmation_code!(user)
      schedule_code_expiration! user
      LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })
    end
  end

  private

  def deliver_confirmation_code!(user)
    ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_now
    user.update!(email_confirmation_code_sent_at: Time.zone.now)
  end

  def schedule_code_expiration!(user)
    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: user.email_confirmation_code_expiration_at
    ).perform_later(
      user.id,
      user.email_confirmation_code
    )
  end
end
