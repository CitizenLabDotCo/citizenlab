# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SendService do
  let(:provider) { instance_double(EmailCampaigns::Sms::Providers::Twilio) }
  let(:phone) { '+14155552671' }

  include_context 'with sms feature enabled'

  before do
    allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(provider)
  end

  describe '#create_delivery' do
    it 'records a pending delivery linked to the campaign without calling the provider' do
      campaign = create(:manual_campaign)
      expect(provider).not_to receive(:send)

      delivery = described_class.new.create_delivery(body: 'hi', campaign_id: campaign.id)

      expect(delivery).to have_attributes(status: 'pending', campaign_id: campaign.id)
    end

    it 'raises and creates nothing when the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')

      expect { described_class.new.create_delivery(body: 'hi') }
        .to raise_error(EmailCampaigns::Sms::Error, /not enabled/)
      expect(EmailCampaigns::Sms::Delivery.count).to eq(0)
    end
  end

  describe '#deliver' do
    let(:delivery) { EmailCampaigns::Sms::Delivery.create!(body: 'hi', status: 'pending') }

    it 'sends an already-created delivery through the provider and stores the status' do
      allow(provider).to receive(:send).and_return(message_sid: 'SM_d', status: 'queued')

      described_class.new.deliver(delivery, to: phone)

      expect(delivery.reload).to have_attributes(status: 'queued', message_sid: 'SM_d')
    end

    it 'normalizes the destination to E.164 before sending' do
      expect(provider).to receive(:send)
        .with(to: phone, body: 'hi')
        .and_return(message_sid: 'SM_1', status: 'queued')

      described_class.new.deliver(delivery, to: '1 (415) 555-2671')
    end

    it 'marks the delivery failed and re-raises for an invalid destination without calling the provider' do
      expect(provider).not_to receive(:send)

      expect { described_class.new.deliver(delivery, to: 'not-a-phone') }
        .to raise_error(EmailCampaigns::Sms::Error, /Invalid phone number/)
      expect(delivery.reload.status).to eq('failed')
    end

    it 'marks the delivery failed and re-raises when the provider fails' do
      allow(provider).to receive(:send).and_raise(EmailCampaigns::Sms::Error, 'nope')

      expect { described_class.new.deliver(delivery, to: phone) }.to raise_error(EmailCampaigns::Sms::Error)
      expect(delivery.reload.status).to eq('failed')
    end

    it 'leaves the delivery pending and re-raises on a transient error so the job can retry it' do
      allow(provider).to receive(:send).and_raise(EmailCampaigns::Sms::ProviderError::RateLimit, 'slow down')

      expect { described_class.new.deliver(delivery, to: phone) }
        .to raise_error(EmailCampaigns::Sms::ProviderError::RateLimit)
      expect(delivery.reload.status).to eq('pending')
    end

    it 'is a no-op for a delivery that is no longer pending, leaving its status untouched' do
      delivery.update!(status: 'sent', message_sid: 'SM_existing')
      expect(provider).not_to receive(:send)

      expect { described_class.new.deliver(delivery, to: phone) }.not_to raise_error
      expect(delivery.reload).to have_attributes(status: 'sent', message_sid: 'SM_existing', error_message: nil)
    end

    it 'does not overwrite a terminal status when the job re-runs (at-least-once delivery)' do
      delivery.update!(status: 'delivered', message_sid: 'SM_final')
      expect(provider).not_to receive(:send)

      expect { described_class.new.deliver(delivery, to: phone) }.not_to raise_error
      expect(delivery.reload).to have_attributes(status: 'delivered', error_message: nil)
    end
  end
end
