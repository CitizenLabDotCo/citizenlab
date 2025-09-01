# frozen_string_literal: true

module FlagInappropriateContent
  module EmailCampaigns
    class InappropriateContentFlaggedMailer < ::EmailCampaigns::ApplicationMailer
      include ::EmailCampaigns::EditableWithPreview

      def editable
        %i[subject_multiloc title_multiloc button_text_multiloc]
      end

      def substitution_variables
        {
          authorName: event&.flaggable_author_name,
          organizationName: organization_name
        }
      end

      def preview_command(recipient)
        data = preview_service.preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            flaggable_title_multiloc: data.idea.title_multiloc,
            flaggable_body_multiloc: data.idea.body_multiloc,
            flaggable_url: data.idea.url,
            flaggable_author_name: data.author.display_name,
            flaggable_type: 'Idea',
            flag_automatically_detected: true
          }
        }
      end
    end
  end
end
