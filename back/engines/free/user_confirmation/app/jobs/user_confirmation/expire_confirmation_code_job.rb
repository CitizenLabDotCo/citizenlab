module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user, code_to_expire)
      return if user.confirmed? || user.email_confirmation_code != code_to_expire

      user.email_confirmation_code = nil
      user.save
    end
  end
end
