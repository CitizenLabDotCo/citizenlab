module EmailCampaigns
  class NewIdeaForAdminMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('event_description', values: { authorName: event.post_author_name, organizationName: organization_name })
    end

    def preheader
      format_message('preheader', values: { authorName: event.post_author_name, organizationName: organization_name })
    end
  end
end
