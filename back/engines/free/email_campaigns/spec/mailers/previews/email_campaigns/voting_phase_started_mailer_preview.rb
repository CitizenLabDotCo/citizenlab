# frozen_string_literal: true

module EmailCampaigns
  class VotingPhaseStartedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      phase = Phase.first
      project = phase.project
      ideas = project.ideas.first(3)
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          project_title_multiloc: project.title_multiloc,
          phase_title_multiloc: phase.title_multiloc,
          ideas: EmailCampaigns::PayloadFormatterService.new.format_ideas_list(ideas, recipient_user)
        }
      }
      campaign = EmailCampaigns::Campaigns::VotingPhaseStarted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
