# frozen_string_literal: true

module EmailCampaigns
  class ProjectReviewRequestMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        requesterName: event&.requester_name,
        projectTitle: localize_for_recipient(event&.project_title_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_title_multiloc: data.project.title_multiloc,
          project_description_multiloc: data.project.description_preview_multiloc,
          admin_project_url: data.project.url,
          requester_name: data.initiator&.first_name
        }
      }
    end
  end
end
