# frozen_string_literal: true

module EmailCampaigns
  class SurveySubmittedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: {
        organizationName: organization_name
      })
    end

    private

    def header_title
      format_message('main_header', values: {
        projectName: localize_for_recipient(event.project_title_multiloc)
      })
    end

    def header_message
      nil
    end

    def preheader
      format_message('preheader', values: { firstName: recipient_first_name, organizationName: organization_name })
    end
  end
end
