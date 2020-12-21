module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.invite_received.subject', organizationName: organization_name)
    end

    def header
      format_message('invitation_header')
    end

    def header_message
      format_message('invitation_header_message', values: { organizationName: organization_name })
    end
  end
end
