# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailer < ApplicationMailer
    include ::EmailCampaigns::DigestableMailer

    protected

    def subject
      I18n.t('email_campaigns.admin_digest.subject', time: Time.now)
    end

    def header
      format_message('title_your_weekly_report', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('text_introduction')
    end
  end
end
