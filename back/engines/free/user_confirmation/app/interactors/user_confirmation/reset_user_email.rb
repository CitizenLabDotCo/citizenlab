module UserConfirmation
  class ResetUserEmail < ApplicationInteractor
    delegate :new_email, :user, to: :context

    def call
      return unless new_email

      context.old_email = user.email
      fail_with_error!(user.errors) unless user.reset_email(new_email)
    end

    def rollback
      user.update(email: context.old_email)
    end
  end
end
