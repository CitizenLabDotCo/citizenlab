# frozen_string_literal: true

module EmailCampaigns
  class VotingLastChanceMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        phaseTitle: localize_for_recipient(event&.phase_title_multiloc),
        projectTitle: localize_for_recipient(event&.project_title_multiloc)
      }
    end

    def preview_command(recipient, _context)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_url: data.project.url,
          phase_title_multiloc: data.phase.title_multiloc,
          project_title_multiloc: data.project.title_multiloc
        }
      }
    end
  end
end
