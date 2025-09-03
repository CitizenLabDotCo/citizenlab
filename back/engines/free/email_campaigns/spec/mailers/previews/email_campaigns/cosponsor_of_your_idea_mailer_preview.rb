# frozen_string_literal: true

module EmailCampaigns
  class CosponsorOfYourIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::CosponsorOfYourIdea)
    end
  end
end
