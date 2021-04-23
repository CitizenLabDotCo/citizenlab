module UserConfirmation
  class ResetUserConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      generate_code
      schedule_code_expiration_job
    end

    def generate_code
      fail_with_error! :code, :invalid, message: 'The code is invalid.' unless user.reset_confirmation_code && user.valid?
      fail_with_error! :code, :too_many_resets, message: 'You\'ve reset too many times.' unless user.increment_confirmation_code_reset_count!
    end

    def schedule_code_expiration_job
      ExpireConfirmationCodeJob.set(wait_until: user.email_confirmation_code_sent_at + 1.day).perform_later
    end
  end
end
