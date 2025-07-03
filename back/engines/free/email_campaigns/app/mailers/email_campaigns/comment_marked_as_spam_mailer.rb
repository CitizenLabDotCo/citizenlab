# frozen_string_literal: true

module EmailCampaigns
  class CommentMarkedAsSpamMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'title_comment_spam_report'
          ),
          define_editable_region(
            :intro_multiloc, default_message_key: 'event_description', type: 'html', allow_blank_locales: true
          ),
          define_editable_region(
            :button_text_multiloc, default_message_key: 'cta_review_comment'
          )
        ]
      end

      def editable_region_variable_keys
        %w[firstName lastName organizationName post]
      end

      def preview_command(recipient: nil)
        data = PreviewService.preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            initiating_user_first_name: data.initiator.first_name,
            initiating_user_last_name: data.initiator.last_name,
            idea_title_multiloc: data.idea.title_multiloc,
            comment_author_name: data.author.display_name,
            comment_body_multiloc: data.comment.body_multiloc,
            comment_url: data.idea.url,
            spam_report_reason_code: 'inappropriate',
            spam_report_other_reason: nil
          }
        }
      end
    end

    protected

    def substitution_variables
      {
        firstName: event.initiating_user_first_name,
        lastName: event.initiating_user_last_name,
        organizationName: organization_name,
        post: localize_for_recipient(event.idea_title_multiloc)
      }
    end
  end
end
