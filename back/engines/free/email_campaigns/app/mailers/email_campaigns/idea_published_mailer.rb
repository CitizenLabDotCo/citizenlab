# frozen_string_literal: true

module EmailCampaigns
  class IdeaPublishedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject1', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header1')
    end

    def header_message
      # TODO: tech debt
      if app_configuration.name == 'Stad Leuven'
        '<p style="margin-bottom: 20px;">
           Bedankt om je idee te delen. We houden je verder op de hoogte van de volgende stappen binnen dit project.
         </p>'.html_safe
      else
        format_message('message_next_steps', values: { firstName: recipient_first_name, organizationName: organization_name })
      end
    end

    def preheader
      format_message('preheader1', values: { firstName: recipient_first_name, organizationName: organization_name })
    end
  end
end
