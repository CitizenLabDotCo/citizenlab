# frozen_string_literal: true

module EmailCampaigns
  class ManualCampaignMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      # TODO: generate commands with campaign#generate_commands method
      command = {
        author: User.first,
        event_payload: {},
        subject_multiloc: { 'en' => 'Title' },
        body_multiloc: {
          'en' => '
            <ul>
              <li>
                <h1>{{ first_name }} {{ last_name }}</h1>
                <p> Here\'s your test email</p>
              </li>
            </ul>
          '
        },
        sender: 'organization',
        reply_to: 'replyto',
        recipient: recipient_user
      }

      campaign = EmailCampaigns::Campaigns::Manual.first_or_create(
        subject_multiloc: { 'en' => 'Title' },
        body_multiloc: {
          'en' => '
            <ul>
              <li>
                <h1>{{ first_name }}</h1>
                <p> Here\'s your test email</p>
              </li>
            </ul>
          '
        },
        sender: 'organization'
      )

      ManualCampaignMailer.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
