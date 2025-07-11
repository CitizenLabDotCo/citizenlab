# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        input_title: localize_for_recipient(event&.idea_title_multiloc),
        inputTitle: localize_for_recipient(event&.idea_title_multiloc),
        authorName: event&.comment_author_name,
        authorNameFull: event&.comment_author_name,
        commentAuthor: event&.initiating_user_first_name&.capitalize
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: data.author.first_name,
          comment_author_name: data.author.display_name,
          comment_body_multiloc: data.comment.body_multiloc,
          comment_url: data.idea.url,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_input_term: 'idea',
          unfollow_url: data.idea.url
        }
      }
    end

    protected

    # Header title has a dynamic default text based on the input term.
    def header_title
      format_editable_region(
        :title_multiloc,
        override_default_key: "main_header.#{event.idea_input_term}"
      )
    end
  end
end
