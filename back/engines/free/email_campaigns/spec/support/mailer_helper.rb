# frozen_string_literal: true

module EmailCampaigns
  module MailerHelper
    def mail_body(mail)
      part = mail.html_part || mail
      part.body.decoded
    end
  end
end
