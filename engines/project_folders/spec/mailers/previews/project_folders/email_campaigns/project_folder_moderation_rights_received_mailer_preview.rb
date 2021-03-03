module ProjectFolders
  module EmailCampaigns
    class ProjectFolderModerationRightsReceivedMailerPreview < ActionMailer::Preview
      def campaign_mail
        recipient = User.first
        project_folder = ProjectFolders::Folder.first
        command = {
          recipient: recipient,
          event_payload: {
            project_folder_id: project_folder.id,
            project_folder_title_multiloc: project_folder.title_multiloc,
            project_folder_projects_count: project_folder.projects.count,
            project_folder_url: Frontend::UrlService.new.model_to_url(project_folder, locale: recipient.locale)
          }
        }
        campaign = ProjectFolders::EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived.first_or_create!

        campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
      end
    end
  end
end
