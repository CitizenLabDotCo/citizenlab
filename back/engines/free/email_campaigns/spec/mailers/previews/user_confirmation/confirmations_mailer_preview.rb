# frozen_string_literal: true

module UserConfirmation
  class ConfirmationsMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def send_confirmation_code
      ::ConfirmationsMailer.with(user: recipient_user).send_confirmation_code
    end
  end
end
