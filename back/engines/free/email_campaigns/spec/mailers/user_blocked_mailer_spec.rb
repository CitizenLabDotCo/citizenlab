# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::UserBlockedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', block_end_at: 5.days.from_now) }

    let(:campaign) { create(:user_blocked_campaign) }
    let(:command) { { recipient: recipient, event_payload: {} } }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('Your account has been temporarily disabled')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the date the user can sign in again' do
      expect(mail.body.encoded).to include('You can sign in again from')
      expect(mail.body.encoded).to include(recipient.block_end_at.strftime('%b %d, %Y'))
    end

    context 'when a block reason is provided' do
      before { recipient.update!(block_reason: 'You were very naughty!') }

      it 'includes the reason for being blocked' do
        expect(mail.body.encoded).to include('for the following reason:')
        expect(mail.body.encoded).to include('You were very naughty!')
      end
    end
  end
end
