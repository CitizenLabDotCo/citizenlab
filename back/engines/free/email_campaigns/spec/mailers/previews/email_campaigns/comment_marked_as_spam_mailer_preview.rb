# frozen_string_literal: true

module EmailCampaigns
  class CommentMarkedAsSpamMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::CommentMarkedAsSpam)
    end
  end
end
