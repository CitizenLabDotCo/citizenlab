# frozen_string_literal: true

module EmailCampaigns
  class InvitationToCosponsorIdeaMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InvitationToCosponsorIdea)
    end
  end
end
