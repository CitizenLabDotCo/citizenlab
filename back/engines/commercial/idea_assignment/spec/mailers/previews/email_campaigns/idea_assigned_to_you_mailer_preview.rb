# frozen_string_literal: true

module EmailCampaigns
  class IdeaAssignedToYouMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(::IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou)
    end
  end
end
