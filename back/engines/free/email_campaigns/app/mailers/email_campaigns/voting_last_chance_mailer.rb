# frozen_string_literal: true

module EmailCampaigns
  class VotingLastChanceMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_last_chance', values: { phaseTitle: event.phase_title_multiloc })
    end

    def header_message
      format_message('event_description', values: { phaseTitle: localize_for_recipient(event.project_title_multiloc) })
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
