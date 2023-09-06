# frozen_string_literal: true

module EmailCampaigns
  class VotingLastChanceMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.is_timeline.first || Project.first
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          phase_title_multiloc: project.phases.first.title_multiloc || 'PHASE TITLE',
          project_title_multiloc: project.title_multiloc
        }
      }

      campaign = EmailCampaigns::Campaigns::VotingLastChance.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
