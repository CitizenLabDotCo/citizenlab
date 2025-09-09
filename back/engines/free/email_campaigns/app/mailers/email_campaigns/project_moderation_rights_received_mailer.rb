# frozen_string_literal: true

module EmailCampaigns
  class ProjectModerationRightsReceivedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        projectName: localize_for_recipient(event&.project_title_multiloc),
        numberOfIdeas: event&.project_ideas_count,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_id: data.project.id,
          project_title_multiloc: data.project.title_multiloc,
          project_ideas_count: 88,
          project_url: data.project.url
        }
      }
    end
  end
end
