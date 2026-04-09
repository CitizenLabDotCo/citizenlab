module EmailCampaigns
  class SpaceModerationRightsReceivedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        spaceName: localize_for_recipient(event&.space_title_multiloc),
        numberOfProjects: event&.space_projects_count,
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          space_id: data.space.id,
          space_title_multiloc: data.space.title_multiloc,
          space_projects_count: 12,
          space_url: data.space.url
        }
      }
    end
  end
end
