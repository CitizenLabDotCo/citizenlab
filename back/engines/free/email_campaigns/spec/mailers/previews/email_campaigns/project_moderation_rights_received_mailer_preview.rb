# frozen_string_literal: true

module EmailCampaigns
  class ProjectModerationRightsReceivedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          project_id: project.id,
          project_title_multiloc: project.title_multiloc,
          project_ideas_count: project.ideas_count,
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale)
        }
      }
      campaign = EmailCampaigns::Campaigns::ProjectModerationRightsReceived.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
