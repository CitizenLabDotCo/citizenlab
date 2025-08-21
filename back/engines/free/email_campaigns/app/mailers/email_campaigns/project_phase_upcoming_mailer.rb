# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseUpcomingMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        firstName: recipient.first_name,
        projectName: localize_for_recipient(event&.project_title_multiloc),
        phaseTitle: localize_for_recipient(event&.phase_title_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: data.phase.title_multiloc,
          phase_url: data.phase.url,
          project_title_multiloc: data.project.title_multiloc,
          project_description_preview_multiloc: data.project.description_preview_multiloc
        }
      }
    end
  end
end
