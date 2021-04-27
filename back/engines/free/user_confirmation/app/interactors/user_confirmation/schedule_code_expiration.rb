module UserConfirmation
  class ScheduleCodeExpiration < ApplicationInteractor
    delegate :user, to: :context

    def call
      schedule_code_expiration_job
    end

    def schedule_code_expiration_job
      ExpireConfirmationCodeJob.set(wait_until: user.email_confirmation_code_sent_at + 1.day).perform_later(user, user.email_confirmation_code)
    end
  end
end
