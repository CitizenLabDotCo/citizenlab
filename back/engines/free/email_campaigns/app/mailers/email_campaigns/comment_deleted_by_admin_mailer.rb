# frozen_string_literal: true

module EmailCampaigns
  class CommentDeletedByAdminMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def campaign_class
        Campaigns::CommentDeletedByAdmin
      end

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
            :button_text_multiloc, default_message_key: 'cta_view'
          )
        ]
      end

      def editable_region_variable_keys
        %w[organizationName]
      end

      def preview_command(recipient: nil)
        data = PreviewService.preview_data(recipient)
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

    protected

    def substitution_variables
      {
        organizationName: organization_name
      }
    end
  end
end
