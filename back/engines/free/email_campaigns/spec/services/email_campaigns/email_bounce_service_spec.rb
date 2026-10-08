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

  describe '#clear' do
    let(:user) { create(:user, email_bounced_at: 1.day.ago, email_bounce_reason: '550 No such user') }

    it 'clears the bounce' do
      service.clear(user)
      expect(user.reload).to have_attributes(email_bounced_at: nil, email_bounce_reason: nil)
    end

    context 'when sending through Mailgun' do
      let(:client) { instance_double(Mailgun::Client) }

      before do
        allow(ActionMailer::Base).to receive_messages(
          delivery_method: :mailgun,
          mailgun_settings: { api_key: 'key', api_host: 'api.eu.mailgun.net', domain: 'mail.example.org' }
        )
        allow(Mailgun::Client).to receive(:new).with('key', 'api.eu.mailgun.net').and_return(client)
      end

      it 'removes the address from the Mailgun bounce list' do
        expect(client).to receive(:delete).with("mail.example.org/bounces/#{ERB::Util.url_encode(user.email)}")
        service.clear(user)
        expect(user.reload.email_bounced_at).to be_nil
      end

      it 'still clears the bounce when Mailgun has no bounce for the address' do
        response = Struct.new(:code, :body).new(404, '{"message":"Address not found in bounces table"}')
        allow(client).to receive(:delete).and_raise(Mailgun::CommunicationError.new('Not found', response))
        expect(ErrorReporter).not_to receive(:report)
        service.clear(user)
        expect(user.reload.email_bounced_at).to be_nil
      end

      it 'reports other Mailgun errors and still clears the bounce' do
        error = Mailgun::CommunicationError.new('Server error', nil)
        allow(client).to receive(:delete).and_raise(error)
        expect(ErrorReporter).to receive(:report).with(error)
        service.clear(user)
        expect(user.reload.email_bounced_at).to be_nil
      end
    end
  end
end
