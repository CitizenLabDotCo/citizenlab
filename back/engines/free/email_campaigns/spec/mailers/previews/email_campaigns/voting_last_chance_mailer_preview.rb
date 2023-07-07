# frozen_string_literal: true

module EmailCampaigns
  class VotingLastChanceMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          phase_title_multiloc: { 'en': 'DUMMY PHASE' },
          project_title_multiloc: { 'en': 'DUMMY PROJECT' }
        }
      }
      campaign = EmailCampaigns::Campaigns::VotingLastChance.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
