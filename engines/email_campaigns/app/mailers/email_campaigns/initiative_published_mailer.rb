module EmailCampaigns
  class InitiativePublishedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header')
    end

    def header_message
      format_message('message_next_steps', values: { userFirstName: recipient_first_name, organizationName: organization_name })
    end

    def preheader
      format_message('preheader', values: { initiativeTitle: localize_for_recipient(event.post_title_multiloc), organizationName: organization_name })
    end
  end
end
