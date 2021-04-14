module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user)
      user.confirmation_code = nil
    end
  end
end
