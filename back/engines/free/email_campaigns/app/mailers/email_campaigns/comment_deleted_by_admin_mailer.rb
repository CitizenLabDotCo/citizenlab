# frozen_string_literal: true

module EmailCampaigns
  class CommentDeletedByAdminMailer < ApplicationMailer
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
          comment_created_at: Time.now.iso8601,
          comment_body_multiloc: data.comment.body_multiloc,
          reason_code: 'other',
          other_reason: data.comment.deleted_reason,
          idea_url: data.idea.url
        }
      }
    end
  end
end
