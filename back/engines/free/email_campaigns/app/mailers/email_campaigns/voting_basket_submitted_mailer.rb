# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketSubmittedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_url: data.project.url,
          voted_ideas: [
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
