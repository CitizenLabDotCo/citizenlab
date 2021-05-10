module UserConfirmation
  class ConfirmationsMailerPreview < ActionMailer::Preview
    def send_confirmation_code
      user = User.first
      user.reset_email_confirmation_code
      user.save
      UserConfirmation::ConfirmationsMailer.with(user: user).send_confirmation_code
    end
  end
end
