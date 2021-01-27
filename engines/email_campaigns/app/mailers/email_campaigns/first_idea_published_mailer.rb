module EmailCampaigns
  class FirstIdeaPublishedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header', values: { firstName: recipient_first_name })
    end

    def header_message
      # TODO: tech debt
      if app_configuration.name == 'Stad Leuven'
        '<p style="margin-bottom: 20px;">
           Bedankt om je eerste idee te delen. We houden je verder op de hoogte van de volgende stappen binnen dit project.
         </p>'.html_safe
      else
        format_message('event_description', values: { firstName: recipient_first_name, organizationName: organization_name })
      end
    end

    def preheader
      format_message('preheader', values: { firstName: recipient_first_name, organizationName: organization_name })
    end
  end
end
