module EmailCampaigns
  class InitiativeMarkedAsSpamMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_spam_report', values: { firstName: event.initiating_user_first_name, lastName: event.initiating_user_last_name })
    end

    def header_message
      false
    end

    def preheader
      format_message('preheader')
    end
  end
end