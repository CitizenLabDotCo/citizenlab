module EmailCampaigns
  class ProjectModerationRightsReceivedMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.first
      project = Project.first
      command = {
        recipient: recipient,
        event_payload: {
          project_id: project.id,
          project_title_multiloc: project.title_multiloc,
          project_ideas_count: project.ideas_count,
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::ProjectModerationRightsReceived.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end