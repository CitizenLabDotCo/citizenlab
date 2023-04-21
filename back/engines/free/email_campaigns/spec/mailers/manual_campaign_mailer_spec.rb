# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) do
      EmailCampaigns::Campaigns::Manual.create!(
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
    end
    let_it_be(:command) do
      {
        author: create(:admin),
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
        recipient: recipient
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to end_with('Title')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'includes the first name body content as defined in liquid email content' do
      expect(mail.body.encoded).to include(recipient.first_name)
    end

    it 'includes the last name body content as defined in liquid email content' do
      expect(mail.body.encoded).to include(recipient.last_name)
    end
  end
end
