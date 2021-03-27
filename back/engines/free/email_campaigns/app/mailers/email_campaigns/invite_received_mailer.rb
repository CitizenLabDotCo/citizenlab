module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('invitation_header')
    end

    def header_message
      format_message('invitation_header_message', values: { organizationName: organization_name })
    end
  end
end
