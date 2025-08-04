# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnIdeaAssignedToYouMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InternalCommentOnIdeaAssignedToYou)
    end
  end
end
