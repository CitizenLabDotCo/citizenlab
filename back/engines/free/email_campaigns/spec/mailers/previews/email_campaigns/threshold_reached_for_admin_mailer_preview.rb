# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::ThresholdReachedForAdmin.first

      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          idea_title_multiloc: { 'en' => 'A nice idea' },
          idea_author_name: 'Chuck Norris',
          idea_url: 'demo.stg.govocal.com',
          assignee_first_name: 'Lady',
          assignee_last_name: 'Gaga'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
