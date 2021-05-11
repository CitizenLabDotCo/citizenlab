module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user, code_to_expire)
      return if user.confirmed? || user.email_confirmation_code != code_to_expire

      user.reset_confirmation_code
      user.save
    end
  end
end
