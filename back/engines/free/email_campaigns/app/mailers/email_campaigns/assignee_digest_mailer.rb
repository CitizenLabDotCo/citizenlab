# frozen_string_literal: true

module EmailCampaigns
  class AssigneeDigestMailer < ApplicationMailer
    include EditableWithPreview

    def editable_region_variable_keys
      %w[organizationName firstName numberIdeas]
    end

    def preview_command(recipient: nil)
      data = PreviewService.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          assigned_inputs: [
            {
              id: data.idea.id,
              title_multiloc: data.idea.title_multiloc,
              url: data.idea.url,
              published_at: Time.now.iso8601,
              assigned_at: Time.now.iso8601,
              author_name: data.author.display_name,
              likes_count: 10,
              dislikes_count: 5,
              comments_count: 4
            }
          ],
          successful_assigned_inputs: [
            {
              id: data.idea.id,
              title_multiloc: data.idea.title_multiloc,
              url: data.idea.url,
              published_at: 5.days.ago.iso8601,
              assigned_at: 5.days.ago.iso8601,
              author_name: data.author.display_name,
              likes_count: 14,
              dislikes_count: 5,
              comments_count: 7
            }
          ],
          need_feedback_assigned_inputs_count: 2
        }
      }
    end

    def substitution_variables
      {
        organizationName: organization_name,
        firstName: recipient_first_name,
        numberIdeas: event&.need_feedback_assigned_inputs_count
      }
    end

    private

    # This email has no intro text
    def header_message
      false
    end
  end
end
