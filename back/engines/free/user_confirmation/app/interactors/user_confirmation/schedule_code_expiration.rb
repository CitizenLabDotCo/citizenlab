module UserConfirmation
  class ScheduleCodeExpiration < ApplicationInteractor
    delegate :user, to: :context
    delegate :email_confirmation_code_expiration_at, to: :user

    def call
      ExpireConfirmationCodeJob.set(wait_until: email_confirmation_code_expiration_at)
                                .perform_later(user, user.email_confirmation_code)
    end
  end
end
