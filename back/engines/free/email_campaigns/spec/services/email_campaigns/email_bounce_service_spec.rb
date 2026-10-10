# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::EmailBounceService do
  subject(:service) { described_class.new }

  describe '#handle_mailgun_event' do
    let!(:user) { create(:user, email: 'Someone@Example.com') }
    let(:event_data) do
      {
        event: 'failed',
        severity: 'permanent',
        reason: 'bounce',
        recipient: 'someone@example.com',
        'delivery-status': { code: 550, message: '', description: 'No such user' }
      }
    end

    it 'marks the user with that email as bounced' do
      service.handle_mailgun_event(event_data)
      expect(user.reload).to have_attributes(email_bounced_at: be_present, email_bounce_reason: '550 No such user')
    end

    it 'falls back to the status message when there is no description' do
      event_data[:'delivery-status'] = { code: 605, message: 'Not delivering to previously bounced address' }
      service.handle_mailgun_event(event_data)
      expect(user.reload.email_bounce_reason).to eq('605 Not delivering to previously bounced address')
    end

    it 'marks addresses Mailgun skips because they bounced before' do
      service.handle_mailgun_event(event_data.merge(reason: 'suppress-bounce'))
      expect(user.reload.email_bounced_at).to be_present
    end

    context 'when the permanent failure is not a bounce' do
      where(:reason) { %w[suppress-unsubscribe suppress-complaint generic] }

      with_them do
        it 'does not mark the user as bounced' do
          service.handle_mailgun_event(event_data.merge(reason: reason))
          expect(user.reload.email_bounced_at).to be_nil
        end
      end
    end

    it 'ignores temporary failures' do
      service.handle_mailgun_event(event_data.merge(severity: 'temporary'))
      expect(user.reload.email_bounced_at).to be_nil
    end

    it 'ignores other events' do
      service.handle_mailgun_event(event_data.merge(event: 'delivered'))
      expect(user.reload.email_bounced_at).to be_nil
    end

    it 'does nothing when no user has that email' do
      expect { service.handle_mailgun_event(event_data.merge(recipient: 'nobody@example.com')) }.not_to raise_error
      expect(user.reload.email_bounced_at).to be_nil
    end
  end
end
