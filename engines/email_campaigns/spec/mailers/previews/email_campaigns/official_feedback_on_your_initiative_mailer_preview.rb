module EmailCampaigns
  class OfficialFeedbackOnYourInitiativeMailerPreview < ActionMailer::Preview
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::OfficialFeedbackOnYourInitiative.first

      command = {
        recipient: User.first,
        event_payload: {
          official_feedback_author_multiloc: { 'en' => 'Citizenlab person' },
          official_feedback_body_multiloc: { 'en' => 'Nice idea, bruh' },
          official_feedback_url: 'https://demo.stg.citizenlab.co',
          post_published_at: Time.zone.today.prev_week.iso8601,
          post_title_multiloc: { 'en' => 'My post is great.' },
          post_author_name: 'Chuck Norris'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
