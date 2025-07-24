# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseStartedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        projectName: localize_for_recipient(event&.project_title_multiloc),
        phaseTitle: localize_for_recipient(event&.phase_title_multiloc)
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: data.phase.title_multiloc,
          phase_start_at: Time.zone.today.iso8601,
          phase_end_at: Time.zone.today.next_month.iso8601,
          phase_url: data.phase.url,
          project_title_multiloc: data.project.title_multiloc,
          project_description_preview_multiloc: data.project.description_preview_multiloc,
          unfollow_url: data.phase.url
        }
      }
    end
  end
end
