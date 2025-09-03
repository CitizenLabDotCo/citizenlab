# frozen_string_literal: true

module EmailCampaigns
  class ProjectPhaseUpcomingMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ProjectPhaseUpcoming)
    end
  end
end
