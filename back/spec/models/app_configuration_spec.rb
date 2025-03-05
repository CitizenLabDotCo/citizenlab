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

  describe '#detect_country!' do
    before do
      app_config = described_class.instance
      app_config.settings['maps']['map_center'] = { 'lat': '51.1657', 'long': '10.4515' }
      app_config.save!
    end

    context 'when country_code is not set' do
      it 'schedules CountryCodeJob when lat and long exist' do
        described_class.instance.country_code = nil
        described_class.instance.save!
        expect { described_class.instance.send(:detect_country!) }
          .to enqueue_job(CountryCodeJob).exactly(:once)
      end
    end

    context 'when country_code is set' do
      before { described_class.instance.country_code = 'DE' }

      it 'schedules CountryCodeJob when lat changed' do
        described_class.instance.settings['maps']['map_center']['lat'] = '51.16'
        described_class.instance.save!
        expect { described_class.instance.send(:detect_country!) }
          .to enqueue_job(CountryCodeJob).exactly(:once)
      end

      it 'schedules CountryCodeJob when long changed' do
        described_class.instance.settings['maps']['map_center']['long'] = '10.45'
        described_class.instance.save!
        expect { described_class.instance.send(:detect_country!) }
          .to enqueue_job(CountryCodeJob).exactly(:once)
      end

      it 'does not schedule CountryCodeJob when other setting changed' do
        described_class.instance.settings['maps']['zoom_level'] = 5
        described_class.instance.save!
        expect { described_class.instance.send(:detect_country!) }
          .not_to enqueue_job(CountryCodeJob)
      end
    end
  end
end
