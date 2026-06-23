# frozen_string_literal: true

module UserBlocking
  class UserBlockedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::UserBlocked)
    end
  end
end
