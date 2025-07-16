# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnYourInternalCommentMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InternalCommentOnYourInternalComment)
    end
  end
end
