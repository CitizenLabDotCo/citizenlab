# frozen_string_literal: true

module EmailCampaigns
  class YourInputInScreeningMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      idea = Idea.first
      prescreening_status = IdeaStatus.find_by(code: 'prescreening')
      command = {
        recipient: recipient_user,
        event_payload: {
          input_id: idea.id,
          input_title_multiloc: idea.title_multiloc,
          input_body_multiloc: idea.body_multiloc,
          input_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient_user.locale)),
          prescreening_status_title_multiloc: prescreening_status.title_multiloc,
          prescreening_status_description_multiloc: prescreening_status.description_multiloc,
          input_term: idea.input_term
        }
      }

      campaign = EmailCampaigns::Campaigns::YourInputInScreening.first

      campaign.mailer_class.with(campaign:, command:).campaign_mail
    end
  end
end
