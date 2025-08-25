# frozen_string_literal: true

module EmailCampaigns
  class VotingPhaseStartedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        projectName: localize_for_recipient(event&.project_title_multiloc),
        numIdeas: event&.ideas&.size,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_url: data.project.url,
          project_title_multiloc: data.project.title_multiloc,
          phase_title_multiloc: data.phase.title_multiloc,
          ideas: [
            {
              title_multiloc: data.idea.title_multiloc,
              url: data.idea.url,
              images: [{ versions: { small: data.placeholder_image_url } }]
            },
            {
              title_multiloc: data.idea.title_multiloc,
              url: data.idea.url,
              images: [{ versions: { small: data.placeholder_image_url } }]
            }
          ]
        }
      }
    end
  end
end
