module UserConfirmation
  class ExpireVerificationCode < ApplicationJob
    def run(user)
      user.confirmation_code = nil
    end
  end
end
