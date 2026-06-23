# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewEmailConfirmationMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', email: 'some_email@email.com', new_email: 'new@email.com') }

    let(:campaign) { create(:new_email_confirmation_campaign) }
    let(:command) { { recipient: recipient, event_payload: { code: '1234' } } }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('Confirm your new email address')
    end

    it 'sends to the new_email address rather than the current email' do
      expect(mail.to).to eq(['new@email.com'])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'shows the confirmation code from the command payload' do
      expect(mail.body.encoded).to match('1234')
    end
  end
end
