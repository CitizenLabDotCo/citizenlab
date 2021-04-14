module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user)
      user.confirmation_code = nil
      user.save
    end
  end
end
