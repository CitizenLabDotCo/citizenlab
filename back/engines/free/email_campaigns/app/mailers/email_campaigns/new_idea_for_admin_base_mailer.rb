# frozen_string_literal: true

module EmailCampaigns
  class NewIdeaForAdminBaseMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        firstName: recipient_first_name,
        authorName: event&.idea_author_name,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          idea_submitted_at: (Time.now - 2.days).iso8601,
          idea_published_at: (Time.now - 2.days).iso8601,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_author_name: data.author.display_name,
          idea_url: data.idea.url
        }
      }
    end
  end
end
