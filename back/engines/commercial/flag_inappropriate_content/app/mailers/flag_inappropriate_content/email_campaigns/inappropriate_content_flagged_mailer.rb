module FlagInappropriateContent
  module EmailCampaigns
    class InappropriateContentFlaggedMailer < ::EmailCampaigns::ApplicationMailer
      protected

      def subject
        format_message('subject', values: { organizationName: organization_name })
      end

      private

      def header_title
        format_message('header_title')
      end

      def header_message
        false
      end
    end
  end
end
