# frozen_string_literal: true

class ResetUserEmail < ApplicationInteractor
  delegate :user, to: :context
  delegate :new_email, to: :context, allow_nil: true

  def call
    return unless new_email

    # Cannot allow resets if the user has no password as could allow others to hijack an existing account
    fail_with_error! :email, message: 'Cannot change email for user with no password' if user.no_password?

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
