# frozen_string_literal: true

module EmailCampaigns
  class CommentOnYourCommentMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'main_header'
          ),
          define_editable_region(
            :intro_multiloc, default_message_key: 'event_description', type: 'html', allow_blank_locales: true
          ),
          define_editable_region(
            :button_text_multiloc, default_message_key: 'cta_reply_to'
          )
        ]
      end

      def editable_region_variable_keys
        %w[authorName authorFirstName organizationName post]
      end

      def preview_command(recipient: nil)
        data = PreviewService.preview_data(recipient)
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

    protected

    def substitution_variables
      {
        authorName: event.comment_author_name,
        authorFirstName: event.initiating_user_first_name,
        organizationName: organization_name,
        post: localize_for_recipient(event.idea_title_multiloc)
      }
    end
  end
end
