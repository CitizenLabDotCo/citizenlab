# frozen_string_literal: true

module EmailCampaigns
  class MentionInOfficialFeedbackMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::MentionInOfficialFeedback)
    end
  end
end
