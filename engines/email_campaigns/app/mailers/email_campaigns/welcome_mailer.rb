module EmailCampaigns
  class WelcomeMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header')
    end

    def header_message
      format_message('message_welcome', values: { organizationName: organization_name })
    end

    def show_unsubscribe_link?
      false
    end
  end
end
