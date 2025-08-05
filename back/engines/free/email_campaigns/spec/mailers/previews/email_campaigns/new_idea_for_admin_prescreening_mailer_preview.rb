# frozen_string_literal: true

module EmailCampaigns
  class NewIdeaForAdminPrescreeningMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::NewIdeaForAdminPrescreening)
    end
  end
end
