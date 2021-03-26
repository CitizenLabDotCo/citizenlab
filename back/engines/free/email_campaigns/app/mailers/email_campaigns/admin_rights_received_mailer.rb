module EmailCampaigns
  class AdminRightsReceivedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_you_became_administrator')
    end

    def header_message
      format_message('message_you_became_administrator', values: { organizationName: organization_name })
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end