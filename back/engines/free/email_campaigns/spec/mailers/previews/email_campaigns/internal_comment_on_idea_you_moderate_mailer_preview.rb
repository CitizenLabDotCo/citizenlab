# frozen_string_literal: true

module EmailCampaigns
  class InternalCommentOnIdeaYouModerateMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InternalCommentOnIdeaYouModerate)
    end
  end
end
