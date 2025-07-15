# frozen_string_literal: true

module EmailCampaigns
  class CommentDeletedByAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::CommentDeletedByAdmin)
    end
  end
end
