# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      command = {
        recipient: recipient_user,
        event_payload: {
          project_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          phase_title_multiloc: { 'en': 'DUMMY PHASE' }
        }
      }
      campaign = EmailCampaigns::Campaigns::VotingBasketNotSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
