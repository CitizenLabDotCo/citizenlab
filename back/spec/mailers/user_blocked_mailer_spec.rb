# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserBlockedMailer do
  describe 'send_email_to_blocked_user' do
    let!(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:message) { described_class.with(user: user).send_user_blocked_email.deliver_now }

    it 'renders the subject' do
      expect(message.subject).to start_with('Your account has been temporarily disabled')
    end

    it 'renders the receiver message' do
      expect(message.to).to eq([user.email])
    end

    it 'renders the sender message' do
      expect(message.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(message.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name')['en'])
    end

    it 'includes date when user will be unblocked' do
      expect(message.body.encoded).to include('You can sign in again from')
      expect(message.body.encoded).to include(user.block_end_at.strftime('%b %d, %Y'))
    end

    context 'when reason for blocking is provided' do
      it 'includes reason for being blocked' do
        user.update(block_reason: 'You were very naughty!')

        expect(message.body.encoded).to include('for the following reason:')
        expect(message.body.encoded).to include(user.block_reason)
      end
    end
  end

  describe 'when sent to users with a different locale set for each' do
    let_it_be(:recipient1) { create(:user, block_end_at: 5.days.from_now, locale: 'en') }
    let_it_be(:recipient2) { create(:user, block_end_at: 5.days.from_now, locale: 'nl-BE') }

    let_it_be(:mail1) { described_class.with(user: recipient1).send_user_blocked_email.deliver_now }
    let_it_be(:mail2) { described_class.with(user: recipient2).send_user_blocked_email.deliver_now }

    it 'renders the mails in the correct language' do
      expect(mail1.body.encoded).to include('Your account has been temporarily disabled')
      expect(mail2.body.encoded).to include('Je account is tijdelijk geblokkeerd')
    end
  end
end
