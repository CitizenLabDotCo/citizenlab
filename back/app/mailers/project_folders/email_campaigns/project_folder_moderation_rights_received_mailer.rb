# frozen_string_literal: true

return unless defined? EmailCampaigns::ApplicationMailer

module ProjectFolders
  module EmailCampaigns
    class ProjectFolderModerationRightsReceivedMailer < ::EmailCampaigns::ApplicationMailer
      include ::EmailCampaigns::EditableWithPreview

      def editable
        %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
      end

      def substitution_variables
        {
          folderName: localize_for_recipient(event&.project_folder_title_multiloc),
          numberOfProjects: event&.project_folder_projects_count,
          organizationName: organization_name
        }
      end

      def preview_command(recipient)
        data = preview_service.preview_data(recipient)
        {
          recipient: recipient,
          event_payload: {
            project_folder_id: data.folder.id,
            project_folder_title_multiloc: data.folder.title_multiloc,
            project_folder_projects_count: 5,
            project_folder_url: data.folder.url
          }
        }
      end
    end
  end
end
