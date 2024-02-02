# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      project = Project.first
      command = {
        recipient: recipient_user,
        event_payload: {
          # TODO: JS - correct survey URL
          survey_url: Frontend::UrlService.new.model_to_url(project, locale: recipient_user.locale),
          context_title_multiloc: project.phases.first.title_multiloc || project.title_multiloc
        }
      }
      campaign = EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
