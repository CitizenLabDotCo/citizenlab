# frozen_string_literal: true

module EmailCampaigns
  class CommentOnYourCommentMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        authorName: event&.comment_author_name,
        authorFirstName: event&.initiating_user_first_name,
        organizationName: organization_name,
        post: localize_for_recipient(event&.idea_title_multiloc)
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data.initiator.first_name,
          initiating_user_last_name: data.initiator.last_name,
          comment_author_name: data.initiator.display_name,
          comment_body_multiloc: data.comment.body_multiloc,
          comment_url: data.idea.url,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_type: 'Idea'
        }
      }
    end
  end
end
