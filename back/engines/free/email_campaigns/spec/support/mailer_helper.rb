# frozen_string_literal: true

module EmailCampaigns
  module MailerHelper
    def mail_body(mail)
      mail.body.encoded.gsub("=\r\n", '')
    end
  end
end
