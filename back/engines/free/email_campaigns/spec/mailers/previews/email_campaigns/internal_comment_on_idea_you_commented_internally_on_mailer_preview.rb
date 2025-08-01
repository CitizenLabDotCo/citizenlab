# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnIdeaYouCommentedInternallyOnMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InternalCommentOnIdeaYouCommentedInternallyOn)
    end
  end
end
