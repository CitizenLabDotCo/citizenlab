# frozen_string_literal: true

module EmailCampaigns
  class IdeaMarkedAsSpamMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        firstName: event&.initiating_user_first_name,
        lastName: event&.initiating_user_last_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data.initiator.first_name,
          initiating_user_last_name: data.initiator.last_name,
          idea_created_at: (Time.now - 1.day).iso8601,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_author_name: data.author.display_name,
          idea_url: data.idea.url,
          spam_report_reason_code: 'wrong_content',
          spam_report_other_reason: nil
        }
      }
    end
  end
end
