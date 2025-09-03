# frozen_string_literal: true

module EmailCampaigns
  module MailerHelper
    # This method extracts the HTML from the email body, without quoted-printable encoding.
    def mail_body(mail)
      part = mail.html_part || mail
      part.body.decoded
    end
  end
end
