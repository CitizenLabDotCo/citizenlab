module UserConfirmation
  class SendConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      send_confirmation_message
      update_user
      schedule_code_expiration_job
    end

    def send_confirmation_message
      unless user.registered_with_email?
        fail_with_error! :registration_method, :invalid, message: 'Confirmation is currently working for emails only.'
      end
      ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_later
    end

    def update_user
      user.email_confirmation_code_sent_at = Time.zone.now
      user.save
    end

    def schedule_code_expiration_job
      ExpireConfirmationCodeJob.set(wait_until: user.email_confirmation_code_sent_at + 1.day).perform_later
    end
  end
end
