# frozen_string_literal: true

class RequestConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  attr_reader :user

  def run(user, new_email: nil)
    @user = user
    raise 'User confirmation is disabled.' if !AppConfiguration.instance.feature_activated?('user_confirmation')
    raise 'Confirmation is currently working for emails only.' if !user.registered_with_email?

    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i)
    if new_email
      user.new_email = new_email
      user.email_confirmation_code_reset_count = 0 # TODO: Why does this need to be set to 0?
    end
    return if !user.valid?

    ActiveRecord::Base.transaction do
      user.save!
      reset_user_confirmation_code user
      deliver_confirmation_code user
      schedule_code_expiration user
      LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i)
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
