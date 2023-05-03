# frozen_string_literal: true

module IdeaAssignment
  module EmailCampaigns
    class IdeaAssignedToYouMailer < ::EmailCampaigns::ApplicationMailer
      protected

      def subject
        format_message('subject', values: { organizationName: organization_name })
      end

      private

      def header_title
        format_message('main_header', values: { firstName: recipient_first_name })
      end

      def header_message
        format_message('event_description_input')
      end

      def preheader
        format_message('preheader_input', values: { organizationName: organization_name, authorName: event.post_author_name })
      end
    end
  end
end
