# frozen_string_literal: true

module EmailCampaigns
  class NewCommentForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::NewCommentForAdmin)
    end
  end
end
