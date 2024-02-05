# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      command = {
        recipient: recipient_user,
        event_payload: {
          survey_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          phase_title_multiloc: project.phases.first.title_multiloc || project.title_multiloc,
          phase_end_at: project.created_at
        }
      }
      campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
