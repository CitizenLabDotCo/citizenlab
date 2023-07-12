# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseStartedMailer < ApplicationMailer
    private

    def project_title
      localize_for_recipient(event.project_title_multiloc)
    end

    def subject
      format_message('subject', values: { projectName: project_title })
    end

    def header_title
      format_message('main_header', values: { projectName: project_title })
    end

    def header_message
      format_message('event_description', values: { organizationName: organization_name })
    end

    def preheader
      format_message('preheader', values: { projectName: project_title })
    end
  end
end
