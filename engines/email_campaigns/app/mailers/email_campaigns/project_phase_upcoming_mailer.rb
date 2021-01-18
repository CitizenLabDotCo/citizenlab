# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseUpcomingMailer < ApplicationMailer
    private

    def project_title
      localize_for_recipient(event.project_title_multiloc)
    end

    def subject
      format_message('subject', values: { projectName: project_title })
    end

    def header_title
      format_message('main_header', values: { firstName: project_title })
    end

    def header_message
      format_message('event_description', values: { projectName: project_title })
    end

    def preheader
      format_message('preheader', values: { projectName: project_title })
    end
  end
end
