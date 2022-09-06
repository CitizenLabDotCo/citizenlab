# frozen_string_literal: true

module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user_id, code_to_expire)
      # First check if the user record still exists.
      user = User.find_by(id: user_id)
      return if user.nil? || user.confirmed? || user.email_confirmation_code != code_to_expire

      user.reset_confirmation_code
      user.save
    end
  end
end
