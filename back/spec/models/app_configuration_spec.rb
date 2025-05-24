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

  describe '#sanitize_organization_name' do
    before { @app_config = described_class.instance }

    it 'removes all HTML tags from organization_name multiloc' do
      @app_config.settings['core']['organization_name'] = {
        'en' => 'City of <script>alert("XSS")</script> Springfield',
        'fr-BE' => 'South Elyse <img src=x onerror=alert(1)>',
        'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
      }

      @app_config.save!

      # Get the sanitized organization name
      sanitized_name = @app_config.reload.settings.dig('core', 'organization_name')

      # Verify all HTML is removed from each language
      expect(sanitized_name['en']).to eq('City of alert("XSS") Springfield')
      expect(sanitized_name['fr-BE']).to eq('South Elyse ')
      expect(sanitized_name['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
