# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::YourInputInScreeningMailer do
  describe 'Welcome' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::YourInputInScreening.create! }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          input_id: SecureRandom.uuid,
          input_title_multiloc: { 'en' => 'title' },
          input_body_multiloc: { 'en' => 'body' },
          input_url: 'http://localhost:3000/ideas/1',
          prescreening_status_title_multiloc: { 'en' => 'prescreening status title' },
          prescreening_status_description_multiloc: { 'en' => 'prescreening status description' },
          input_term: 'project'
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject which mentions the title' do
      expect(mail.subject).to include('title')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'mentions the translated input term' do
      expect(mail.body.encoded).to include('project')
    end

    it 'mentions the translated prescreening status title and description' do
      expect(mail.body.encoded).to include('prescreening status title')
      expect(mail.body.encoded).to include('prescreening status description')
    end
  end
end
