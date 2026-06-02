# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sms::Sender do
  let(:twilio_provider) { instance_double(Sms::Providers::Twilio) }
  let(:aws_provider) { instance_double(Sms::Providers::Aws) }

  before do
    allow(Sms::Providers::Twilio).to receive(:new).and_return(twilio_provider)
    allow(Sms::Providers::Aws).to receive(:new).and_return(aws_provider)
  end

  describe '#send' do
    it 'creates a delivery, sends via Twilio by default, marks it sent, and returns it' do
      allow(twilio_provider).to receive(:send).and_return(message_sid: 'SM_abc', status: 'queued')

      delivery = nil
      expect { delivery = described_class.new.send(to: '+14155552671', body: 'hi') }
        .to change(SmsDelivery, :count).by(1)

      expect(delivery).to eq(SmsDelivery.last)
      expect(delivery.status).to eq('sent')
      expect(delivery.message_sid).to eq('SM_abc')
    end

    it 'routes to the AWS provider when provider: :aws is passed' do
      allow(aws_provider).to receive(:send).and_return(message_sid: 'aws-1', status: 'queued')
      expect(twilio_provider).not_to receive(:send)

      delivery = described_class.new.send(to: '+14155552671', body: 'hi', provider: :aws)

      expect(delivery.status).to eq('sent')
      expect(delivery.message_sid).to eq('aws-1')
    end

    it 'accepts the provider as a string' do
      allow(aws_provider).to receive(:send).and_return(message_sid: 'aws-2', status: 'queued')

      delivery = described_class.new.send(to: '+14155552671', body: 'hi', provider: 'aws')

      expect(delivery.message_sid).to eq('aws-2')
    end

    it 'raises Sms::Error for an unknown provider' do
      expect { described_class.new.send(to: '+14155552671', body: 'hi', provider: :carrier_pigeon) }
        .to raise_error(Sms::Error, /Unknown SMS provider/)
      expect(SmsDelivery.count).to eq(0)
    end

    it 'normalizes the phone number before storing' do
      allow(twilio_provider).to receive(:send).and_return(message_sid: 'SM_1', status: 'queued')

      delivery = described_class.new.send(to: '1 (415) 555-2671', body: 'hi')

      expect(delivery.phone_number).to eq('+14155552671')
    end

    it 'rejects invalid phone numbers without calling the provider or creating a delivery' do
      expect(twilio_provider).not_to receive(:send)
      expect { described_class.new.send(to: 'not-a-phone', body: 'hi') }
        .to raise_error(Sms::Error, /Invalid phone number/)
      expect(SmsDelivery.count).to eq(0)
    end

    it 'marks the delivery failed and re-raises when the provider fails' do
      allow(twilio_provider).to receive(:send).and_raise(Sms::Error, 'Twilio rejected it')

      expect { described_class.new.send(to: '+14155552671', body: 'hi') }
        .to raise_error(Sms::Error)

      delivery = SmsDelivery.last
      expect(delivery.status).to eq('failed')
      expect(delivery.error_message).to eq('Twilio rejected it')
    end
  end
end
