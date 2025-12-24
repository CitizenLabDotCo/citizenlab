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

  describe '.platform_start_at' do
    it 'returns the platform creation time by default' do
      app_config = described_class.instance
      expect(app_config.platform_start_at.to_i).to eq app_config.created_at.to_i
    end

    it 'returns the overridden platform start time if set' do
      overridden_time = 1.week.ago.beginning_of_day
      app_config = described_class.instance
      app_config.override_platform_start_at = overridden_time
      app_config.save!

      expect(app_config.platform_start_at.to_i).to eq overridden_time.to_i
    end
  end
end
