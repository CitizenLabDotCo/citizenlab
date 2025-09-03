# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        status: localize_for_recipient(event&.idea_status_title_multiloc),
        input_title: localize_for_recipient(event&.idea_title_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          idea_title_multiloc: data.idea.title_multiloc,
          idea_url: data.idea.url,
          idea_status_title_multiloc: data.input_status.title_multiloc,
          unfollow_url: data.idea.url
        }
      }
    end
  end
end
