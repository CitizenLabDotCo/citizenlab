module UserConfirmation
  class SendNewConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      generate_confirmation_code
      send_confirmation_message
      schedule_code_expiration_job
    end

    def generate_confirmation_code
      user.reset_confirmation_code
      fail_with_error! :code, :invalid, message: 'Could not create confirmation code.' unless user.valid?

      fail_with_error! :code, :too_many_resets, message: 'You\'ve sent too many confirmation codes.' unless user.increment_email_confirmation_sent_count!
    end

    def send_confirmation_message
      unless user.registered_with_email?
        fail_with_error! :registration_method, :invalid, message: 'Confirmation is currently working for emails only.'
      end

      ConfirmationsMailer.with(user: user).send_confirmation_code.deliver!
    end

    def schedule_code_expiration_job
      ExpireConfirmationCodeJob.set(wait_until: user.email_confirmation_code_sent_at + 1.day).perform_later
    end
  end
end
