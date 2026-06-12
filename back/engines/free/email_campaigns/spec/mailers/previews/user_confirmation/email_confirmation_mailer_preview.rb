# frozen_string_literal: true

module UserConfirmation
  class EmailConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def send_code
      ::EmailConfirmationMailer.with(user: recipient_user).send_code
    end
  end
end
