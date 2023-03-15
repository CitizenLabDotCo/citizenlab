# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserBlockedMailer do
  include_context 'when user_blocking duration is 90 days' do
    describe 'send_email_to_blocked_user' do
      let!(:user) { create(:user, block_start_at: 5.days.ago) }
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
  end
end
