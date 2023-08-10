# frozen_string_literal: true

module EmailCampaigns
  class ProjectPublishedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ProjectPublished.first

      command = {
        recipient: recipient_user,
        event_payload: {
          project_title_multiloc: { 'en' => 'Parks Renewal Project' },
          project_ideas_count: 81,
          project_url: 'http://localhost:4000/en/projects/parks-renewal-project'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
