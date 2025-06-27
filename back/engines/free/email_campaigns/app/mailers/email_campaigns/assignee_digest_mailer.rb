# frozen_string_literal: true

module EmailCampaigns
  class AssigneeDigestMailer < ApplicationMailer
    include EditableWithPreview

    class << self
      def campaign_class
        Campaigns::AssigneeDigest
      end

      def editable_regions
        [
          define_editable_region(
            :subject_multiloc, default_message_key: 'subject'
          ),
          define_editable_region(
            :title_multiloc, default_message_key: 'title_your_weekly_report'
          ),
          define_editable_region(
            :button_text_multiloc, default_message_key: 'cta_manage_your_input'
          )
        ]
      end

      def editable_region_variable_keys
        %w[organizationName firstName numberIdeas]
      end

      def preview_command(recipient: nil)
        data = preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            assigned_inputs: [
              {
                id: data[:id],
                title_multiloc: data[:idea_title_multiloc],
                url: data[:idea_url],
                published_at: Time.now.iso8601,
                assigned_at: Time.now.iso8601,
                author_name: data[:user_display_name],
                likes_count: 10,
                dislikes_count: 5,
                comments_count: 4
              }
            ],
            successful_assigned_inputs: [
              {
                id: data[:id],
                title_multiloc: data[:idea_title_multiloc],
                url: data[:idea_url],
                published_at: 5.days.ago.iso8601,
                assigned_at: 5.days.ago.iso8601,
                author_name: data[:user_display_name],
                likes_count: 14,
                dislikes_count: 5,
                comments_count: 7
              }
            ],
            need_feedback_assigned_inputs_count: 2
          }
        }
      end
    end

    protected

    def substitution_variables
      {
        organizationName: organization_name,
        firstName: recipient_first_name,
        numberIdeas: event.need_feedback_assigned_inputs_count
      }
    end

    private

    def header_message
      false
    end
  end
end
