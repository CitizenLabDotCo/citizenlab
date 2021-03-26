# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailer < ApplicationMailer
    private

    def subject
      format_message('subject', values: { time: formatted_todays_date })
    end

    def header_title
      format_message('title_your_weekly_report', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('text_introduction')
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
