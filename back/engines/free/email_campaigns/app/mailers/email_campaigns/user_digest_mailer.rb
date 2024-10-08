# frozen_string_literal: true

module EmailCampaigns
  class UserDigestMailer < ApplicationMailer
    private

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('title_your_weekly_report')
    end

    def header_message
      format_message('intro_text', values: { organizationName: organization_name })
    end
  end
end
