# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::EmailConfirmationMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', email: 'some_email@email.com') }

    let(:campaign) { create(:email_confirmation_campaign) }
    let(:command) { { recipient: recipient, event_payload: { code: '1234' } } }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('Confirm your email address')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns the organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'shows the confirmation code from the command payload' do
      expect(mail.body.encoded).to match('1234')
    end
  end
end
