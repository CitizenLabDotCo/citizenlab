# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
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
          idea_author_name: data.author.display_name,
          idea_url: data.idea.url,
          assignee_first_name: recipient.first_name,
          assignee_last_name: recipient.last_name
        }
      }
    end
  end
end
