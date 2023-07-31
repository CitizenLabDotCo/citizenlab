# frozen_string_literal: true

module EmailCampaigns
  class VotingResultsMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: {
        organizationName: organization_name,
        phaseTitle: localize_for_recipient(event.phase_title_multiloc)
      })
    end

    private

    def header_title
      format_message('title_results', values: { phaseTitle: localize_for_recipient(event.phase_title_multiloc) })
    end

    def header_message
      nil
    end

    def preheader
      format_message('preheader', values: {
        organizationName: organization_name,
        phaseTitle: localize_for_recipient(event.phase_title_multiloc)
      })
    end
  end
end
