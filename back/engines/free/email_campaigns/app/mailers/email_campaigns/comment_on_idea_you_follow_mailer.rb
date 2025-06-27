# frozen_string_literal: true

module EmailCampaigns
  class CommentOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def campaign_class
        Campaigns::CommentOnIdeaYouFollow
      end

      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'main_header.idea'
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
        %w[organizationName input_title inputTitle authorName authorNameFull commentAuthor]
      end

      def preview_command(recipient: nil)
        data = preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            initiating_user_first_name: data[:user_first_name],
            comment_author_name: data[:user_display_name],
            comment_body_multiloc: data[:comment_body_multiloc],
            comment_url: data[:idea_url],
            idea_title_multiloc: data[:idea_title_multiloc],
            idea_input_term: 'idea',
            unfollow_url: data[:idea_url]
          }
        }
      end
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name,
        input_title: localize_for_recipient(event.idea_title_multiloc),
        inputTitle: localize_for_recipient(event.idea_title_multiloc),
        authorName: event.comment_author_name,
        authorNameFull: event.comment_author_name,
        commentAuthor: event.initiating_user_first_name&.capitalize
      }
    end

    def header_title
      format_editable_region(
        :title_multiloc,
        override_default_key: "main_header.#{event.idea_input_term}"
      )
    end
  end
end
