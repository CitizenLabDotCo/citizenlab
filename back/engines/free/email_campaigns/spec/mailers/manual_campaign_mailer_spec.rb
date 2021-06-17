require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) do
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
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
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

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:mail_document) { Nokogiri::HTML.fragment(mail.body.encoded) }

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
