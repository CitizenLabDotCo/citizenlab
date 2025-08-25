# frozen_string_literal: true

module EmailCampaigns
  class SurveySubmittedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::SurveySubmitted)
    end
  end
end
