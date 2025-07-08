# frozen_string_literal: true

module EmailCampaigns
  class MentionInInternalCommentMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::MentionInInternalComment)
    end
  end
end
