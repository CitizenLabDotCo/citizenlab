# frozen_string_literal: true

module UserConfirmation
  class NewEmailConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def send_code
      ::NewEmailConfirmationMailer.with(user: recipient_user).send_code
    end
  end
end
