# frozen_string_literal: true

module EmailCampaigns
  class SurveySubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first

      command = {
        recipient: recipient_user,
        event_payload: {
          project_title_multiloc: project.title_multiloc,
        }
      }

      campaign = EmailCampaigns::Campaigns::SurveySubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
