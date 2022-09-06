# frozen_string_literal: true

module UserConfirmation
  class ExpireConfirmationCodeJob < ApplicationJob
    def run(user_id, code_to_expire)
      # We first check if the record exists to cover the case where the user has been deleted.
      user = User.find_by(id: user_id)
      return if user.nil? || user.confirmed? || user.email_confirmation_code != code_to_expire

      user.reset_confirmation_code
      user.save
    end
  end
end
