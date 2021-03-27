module EmailCampaigns
  class InviteReminderMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('invitation_header')
    end

    def header_message
      ''
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
