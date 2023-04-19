# frozen_string_literal: true

# Called only when requesting a new code but changing your email from the confirm modal
class ResetUserEmail < ApplicationInteractor
  delegate :user, to: :context
  delegate :new_email, to: :context, allow_nil: true

  def call
    return unless new_email

    context.old_email = user.email
    user.reset_email!(new_email)
  rescue ActiveRecord::RecordInvalid => _e
    fail_with_error!(user.errors)
  end

  def rollback
    return unless context.old_email

    user.update!(email: context.old_email)
  end
end
