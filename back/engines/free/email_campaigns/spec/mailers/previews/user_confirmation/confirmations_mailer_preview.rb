# frozen_string_literal: true

module UserConfirmation
  class ConfirmationsMailerPreview < ActionMailer::Preview
    def send_confirmation_code
      user = User.first
      user.save
      ::ConfirmationsMailer.with(user: user).send_confirmation_code
    end
  end
end
