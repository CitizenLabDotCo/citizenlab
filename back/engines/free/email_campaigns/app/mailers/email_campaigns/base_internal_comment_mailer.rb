# frozen_string_literal: true

module EmailCampaigns
  class BaseInternalCommentMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        post: localize_for_recipient(event&.idea_title_multiloc),
        authorNameFull: event&.internal_comment_author_name,
        firstName: event&.initiating_user_first_name
      }
    end

    def preview_command(recipient)
      @recipient = recipient
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data.initiator.first_name,
          initiating_user_last_name: data.initiator.last_name,
          internal_comment_author_name: data.author.display_name,
          internal_comment_body: localize_for_recipient(data.comment.body_multiloc),
          internal_comment_url: data.comment.url,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_body_multiloc: data.idea.body_multiloc,
          idea_image_medium_url: data.placeholder_image_url
        }
      }
    end
  end
end
