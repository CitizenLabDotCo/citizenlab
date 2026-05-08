# frozen_string_literal: true

module EmailCampaigns
  class ProposalExpiredForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProposalExpiredForAdmin)
    end
  end
end
