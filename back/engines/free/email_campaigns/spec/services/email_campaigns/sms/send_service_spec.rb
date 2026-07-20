# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SendService do
  let(:provider) { instance_double(EmailCampaigns::Sms::Providers::Twilio) }
  let(:phone) { '+14155552671' }

  include_context 'with sms feature enabled'

  before do
    allow(EmailCampaigns::Sms::Providers::Twilio).to receive(:new).and_return(provider)
  end

  describe '#provider' do
    let(:blank_credentials) do
      { 'twilio_account_sid' => '', 'twilio_auth_token' => '', 'twilio_messaging_service_sid' => '' }
    end

    it 'uses the fake provider in development when Twilio credentials are missing' do
      allow(Rails.env).to receive(:development?).and_return(true)
      SettingsService.new.activate_feature!('sms', settings: blank_credentials)
      expect(EmailCampaigns::Sms::Providers::Fake).to receive(:new)

      described_class.new.send(:provider)
    end

    it 'uses the Twilio provider in development when Twilio credentials are configured' do
      allow(Rails.env).to receive(:development?).and_return(true)
      expect(EmailCampaigns::Sms::Providers::Twilio).to receive(:new)
      expect(EmailCampaigns::Sms::Providers::Fake).not_to receive(:new)

      described_class.new.send(:provider)
    end

    it 'always uses the Twilio provider outside development, even without credentials' do
      allow(Rails.env).to receive(:development?).and_return(false)
      SettingsService.new.activate_feature!('sms', settings: blank_credentials)
      expect(EmailCampaigns::Sms::Providers::Twilio).to receive(:new)
      expect(EmailCampaigns::Sms::Providers::Fake).not_to receive(:new)

      described_class.new.send(:provider)
    end
  end

  describe '#create_delivery' do
    it 'records a pending delivery linked to the campaign without calling the provider' do
      campaign = create(:manual_campaign)
      expect(provider).not_to receive(:send)

      delivery = described_class.new.create_delivery(body: 'hi', to: phone, campaign_id: campaign.id)

      expect(delivery).to have_attributes(status: 'pending', campaign_id: campaign.id)
    end

    it 'raises and creates nothing when the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')

      expect { described_class.new.create_delivery(body: 'hi', to: phone) }
        .to raise_error(EmailCampaigns::Sms::Error, /not enabled/)
      expect(EmailCampaigns::Sms::Delivery.count).to eq(0)
    end

    it 'raises and creates nothing when the destination is not a valid phone number' do
      expect { described_class.new.create_delivery(body: 'hi', to: 'not-a-phone') }
        .to raise_error(EmailCampaigns::Sms::Error, /Invalid phone number/)
      expect(EmailCampaigns::Sms::Delivery.count).to eq(0)
    end

    it 'raises and creates nothing when the destination country is not allowed' do
      # +14155552671 is a US number.
      SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['BE'] })

      expect { described_class.new.create_delivery(body: 'hi', to: phone) }
        .to raise_error(EmailCampaigns::Sms::Error, /not allowed/)
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

    context 'with an allowed-country list configured' do
      # +14155552671 is a US number.
      it 'sends when the destination country is on the allow-list' do
        SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['US'] })
        allow(provider).to receive(:send).and_return(message_sid: 'SM_ok', status: 'queued')

        described_class.new.deliver(delivery, to: phone)

        expect(delivery.reload.status).to eq('queued')
      end

      it 'marks the delivery failed and re-raises when the destination country is not allowed' do
        SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['BE'] })
        expect(provider).not_to receive(:send)

        expect { described_class.new.deliver(delivery, to: phone) }
          .to raise_error(EmailCampaigns::Sms::Error, /not allowed/)
        expect(delivery.reload.status).to eq('failed')
      end

      it 'sends to any country when the allow-list is empty' do
        SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => [] })
        allow(provider).to receive(:send).and_return(message_sid: 'SM_ok', status: 'queued')

        described_class.new.deliver(delivery, to: phone)

        expect(delivery.reload.status).to eq('queued')
      end
    end
  end
end
