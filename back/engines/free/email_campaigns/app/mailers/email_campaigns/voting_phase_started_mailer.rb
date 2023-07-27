# frozen_string_literal: true

module EmailCampaigns
  class VotingPhaseStartedMailer < ApplicationMailer
    private

    def project_title
      localize_for_recipient(event.project_title_multiloc)
    end

    def subject
      format_message('subject', values: {
        organizationName: organization_name,
        projectName: localize_for_recipient(event.project_title_multiloc)
      })
    end

    def header_title
      localize_for_recipient(event.project_title_multiloc)
    end

    def header_message
      format_message('event_description', values: {
        projectName: localize_for_recipient(event.project_title_multiloc),
        numIdeas: event.ideas.size
      })
    end

    def preheader
      format_message('preheader', values: {
        organizationName: organization_name,
        projectName: localize_for_recipient(event.project_title_multiloc)
      })
    end
  end
end
