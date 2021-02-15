return unless defined? ::EmailCampaigns::ApplicationMailer

module ProjectFolders
  module EmailCampaigns
    class ProjectFolderModerationRightsReceivedMailer < ::EmailCampaigns::ApplicationMailer
      protected

      def subject
        format_message('subject', values: { organizationName: organization_name })
      end

      private

      def header_title
        format_message('title_added_as_folderadmin')
      end

      def header_message
        format_message('message_added_as_folderadmin', values: { organizationName: organization_name })
      end

      def preheader
        format_message('preheader', values: { organizationName: organization_name })
      end
    end
  end
end
