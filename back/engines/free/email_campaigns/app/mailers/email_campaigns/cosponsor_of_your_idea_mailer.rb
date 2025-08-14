# frozen_string_literal: true

module EmailCampaigns
  class CosponsorOfYourIdeaMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        cosponsorName: event&.idea_cosponsor_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          idea_title_multiloc: data.idea.title_multiloc,
          idea_body_multiloc: data.idea.title_multiloc,
          idea_author_name: data.author.display_name,
          idea_cosponsor_name: data.initiator.display_name,
          idea_url: data.idea.url,
          idea_image_medium_url: data.placeholder_image_url
        }
      }
    end
  end
end
