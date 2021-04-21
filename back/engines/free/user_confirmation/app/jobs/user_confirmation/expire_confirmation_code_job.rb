module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user)
      user.email_confirmation_code = nil
      user.save
    end
  end
end
