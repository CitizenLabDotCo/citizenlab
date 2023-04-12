# frozen_string_literal: true

class ScheduleCodeExpiration < ApplicationInteractor
  delegate :user, to: :context
  delegate :email_confirmation_code_expiration_at, to: :user

  def call
    ExpireConfirmationCodeOrDeleteJob.set(wait_until: email_confirmation_code_expiration_at)
      .perform_later(user.id, user.email_confirmation_code)
  end
end
