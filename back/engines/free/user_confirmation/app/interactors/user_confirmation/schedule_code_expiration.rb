module UserConfirmation
  class ScheduleCodeExpiration < ApplicationInteractor
    delegate :user, to: :context

    def call
      expire_at = (user.email_confirmation_code_sent_at || Time.zone.now) + 1.day
      ExpireConfirmationCodeJob.set(wait_until: expire_at).perform_later(user, user.email_confirmation_code)
    end
  end
end
