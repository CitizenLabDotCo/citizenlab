# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sms::Sender do
  let(:twilio_provider) { instance_double(Sms::Providers::Twilio) }

  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_phone_number' => '+15005550006'
    })
    allow(Sms::Providers::Twilio).to receive(:new).and_return(twilio_provider)
  end

  describe '#send_now' do
    it 'raises Sms::Error and creates no delivery when the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')

      expect(twilio_provider).not_to receive(:send)
      expect { described_class.new.send_now(to: '+14155552671', body: 'hi') }
        .to raise_error(Sms::Error, /not enabled/)
      expect(Sms::Delivery.count).to eq(0)
    end

    it 'creates a delivery, sends via Twilio by default, stores the returned status, and returns it' do
      allow(twilio_provider).to receive(:send).and_return(message_sid: 'SM_abc', status: 'queued')

      delivery = nil
      expect { delivery = described_class.new.send_now(to: '+14155552671', body: 'hi') }
        .to change(Sms::Delivery, :count).by(1)

      expect(delivery).to eq(Sms::Delivery.last)
      expect(delivery.status).to eq('queued')
      expect(delivery.message_sid).to eq('SM_abc')
    end

    it 'normalizes the phone number before storing' do
      allow(twilio_provider).to receive(:send).and_return(message_sid: 'SM_1', status: 'queued')

      delivery = described_class.new.send_now(to: '1 (415) 555-2671', body: 'hi')

      expect(delivery.phone_number).to eq('+14155552671')
    end

    it 'rejects invalid phone numbers without calling the provider or creating a delivery' do
      expect(twilio_provider).not_to receive(:send)
      expect { described_class.new.send_now(to: 'not-a-phone', body: 'hi') }
        .to raise_error(Sms::Error, /Invalid phone number/)
      expect(Sms::Delivery.count).to eq(0)
    end

    it 'marks the delivery failed and re-raises when the provider fails' do
      allow(twilio_provider).to receive(:send).and_raise(Sms::Error, 'Twilio rejected it')

      expect { described_class.new.send_now(to: '+14155552671', body: 'hi') }
        .to raise_error(Sms::Error)

      delivery = Sms::Delivery.last
      expect(delivery.status).to eq('failed')
      expect(delivery.error_message).to eq('Twilio rejected it')
    end
  end
end
