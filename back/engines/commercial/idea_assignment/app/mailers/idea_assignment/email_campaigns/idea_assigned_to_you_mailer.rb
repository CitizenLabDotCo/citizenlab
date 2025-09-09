# frozen_string_literal: true

module IdeaAssignment
  module EmailCampaigns
    class IdeaAssignedToYouMailer < ::EmailCampaigns::ApplicationMailer
      include ::EmailCampaigns::EditableWithPreview

      def editable
        %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
      end

      def substitution_variables
        {
          firstName: recipient&.first_name,
          authorName: event&.post_author_name,
          organizationName: organization_name
        }
      end

      def preview_command(recipient)
        data = preview_service.preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            post_title_multiloc: data.idea.title_multiloc,
            post_body_multiloc: data.idea.body_multiloc,
            post_author_name: data.author.display_name,
            post_url: data.idea.url
          }
        }
      end
    end
  end
end
