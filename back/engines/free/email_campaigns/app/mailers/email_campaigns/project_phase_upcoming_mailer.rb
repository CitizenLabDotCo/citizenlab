# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseUpcomingMailer < ApplicationMailer
    include EditableWithPreview
    include PhaseBox

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        firstName: recipient&.first_name,
        projectName: localize_for_recipient(event&.project_title_multiloc),
        phaseTitle: localize_for_recipient(event&.phase_title_multiloc),
        organizationName: organization_name,
        startDate: localize_date_for_recipient(event&.phase_start_at)
      }
    end

    def preview_command(recipient, _context)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: data.phase.title_multiloc,
          phase_start_at: 7.days.from_now.to_date,
          phase_end_at: 4.weeks.from_now.to_date,
          phase_description_multiloc: data.phase.description_multiloc,
          phase_setup_url: data.phase.url,
          project_title_multiloc: data.project.title_multiloc
        }
      }
    end
  end
end
