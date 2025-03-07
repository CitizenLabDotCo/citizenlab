# frozen_string_literal: true

module EmailCampaigns
  class MentionInOfficialFeedbackMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      campaign = EmailCampaigns::Campaigns::MentionInOfficialFeedback.first

      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_user,
        event_payload: {
          official_feedback_author_multiloc: { 'en' => 'Citizenlab person' },
          official_feedback_body_multiloc: { 'en' => 'Nice idea, bruh' },
          official_feedback_url: 'https://demo.stg.govocal.com',
          idea_published_at: Time.zone.today.prev_week.iso8601,
          idea_title_multiloc: { 'en' => 'My post is great.' },
          idea_author_name: 'Chuck Norris',
          idea_type: 'Idea'
        }
      }

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
