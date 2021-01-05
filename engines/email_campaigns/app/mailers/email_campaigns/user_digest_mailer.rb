module EmailCampaigns
  class UserDigestMailer < ApplicationMailer
    private

    def subject
      I18n.t('email_campaigns.user_digest.subject', organizationName: organization_name)
    end

    def header
      format_message('title_your_weekly_report')
    end

    def header_message
      format_message('intro_text', values: { organizationName: organization_name })
    end
  end
end
