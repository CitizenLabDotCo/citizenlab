# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnInitiativeYouFollowMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::OfficialFeedbackOnInitiativeYouFollow.first

      command = {
        recipient: recipient_user,
        event_payload: {
          official_feedback_author_multiloc: { 'en' => 'City of Plattsburgh Official' },
          official_feedback_body_multiloc: { 'en' => 'Thank you for taking the time to comment on our parks. We value your feedback and will be looking at improving the dog park in the same way the one at the city beach has been improved.' },
          official_feedback_url: 'https://demo.stg.citizenlab.co',
          post_published_at: Time.zone.today.prev_week.iso8601,
          post_title_multiloc: { 'en' => 'Fence around the park' },
          post_author_name: 'Julia Langer'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
