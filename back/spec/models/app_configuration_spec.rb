# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration do
  describe '.instance' do
    it 'is reset when the tenant is reset' do
      tenant = Tenant.current

      expect(described_class.instance).not_to be_nil
      Apartment::Tenant.reset
      expect { described_class.instance }.to raise_error(ActiveRecord::RecordNotFound)
    ensure
      tenant.switch!
    end
  end

  describe '.timezone' do
    before do
      app_config = described_class.instance
      app_config.settings['core']['timezone'] = timezone_name
      # We skip validation to be able to test invalid timezones.
      app_config.save!(validate: false)
    end

    context 'when the timezone name is valid' do
      let(:timezone_name) { 'Europe/Amsterdam' }

      it 'returns the correct timezone object' do
        expected_timezone = Time.find_zone(timezone_name)
        expect(described_class.timezone).to eq(expected_timezone)
      end
    end

    context 'when the timezone name is invalid' do
      let(:timezone_name) { 'Invalid/Timezone' }

      it 'raises a KeyError' do
        expect { described_class.timezone }.to raise_error(KeyError, timezone_name)
      end
    end
  end

  describe 'after_save timezone update' do
    it 'updates Time.zone when the timezone setting changes' do
      config = described_class.instance
      config.settings['core']['timezone'] = 'America/New_York'

      expect { config.save! }.to change(Time, :zone)
        .to(Time.find_zone('America/New_York'))
    end
  end

  describe 'sms allowed_country_codes validation' do
    let(:config) { described_class.instance }

    before do
      config.settings['sms'] = {
        'allowed' => true,
        'enabled' => true,
        'twilio_account_sid' => 'AC_test',
        'twilio_auth_token' => 'token',
        'twilio_messaging_service_sid' => 'MG_test'
      }
    end

    it 'is valid with known ISO 3166-1 alpha-2 country codes' do
      config.settings['sms']['allowed_country_codes'] = %w[BE FR]
      expect(config).to be_valid
    end

    it 'is invalid with an unknown country code' do
      config.settings['sms']['allowed_country_codes'] = ['XX']
      expect(config).not_to be_valid
    end
  end
end
