# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration do
  describe 'host format validation' do
    it 'rejects a change to an invalid host' do
      config = described_class.instance
      config.host = 'Uppercase.example.com'

      expect(config).to be_invalid
    end

    # `cl2back:clean_tenant_settings` runs on every deploy and saves the configuration of every
    # tenant. One host that got in without passing through the model used to abort the whole
    # task, and with it the deploy.
    it 'does not re-check a persisted host that has not changed' do
      config = described_class.instance
      config.update_column(:host, 'Uppercase.example.com')
      config.reload

      config.settings['core']['organization_name'] = { 'en' => 'Changed' }

      expect(config).to be_valid
    end
  end

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

  describe 'helper text sanitization' do
    using RSpec::Parameterized::TableSyntax

    let(:config) { described_class.instance }
    let(:payload) do
      <<~HTML.squish
        <b>bold</b><img src="x" onerror="alert(1)"><script>alert(1)</script><style>body{display:none}</style>
        <a href="javascript:alert(1)">js</a><h1 class="title">Title</h1>
        <iframe src="https://maps.example.org/m" style="border:0;" allow="geolocation"></iframe>
      HTML
    end
    let(:sanitized) do
      <<~HTML.squish
        <b>bold</b> <a rel="nofollow">js</a><h1 class="title">Title</h1>
        <iframe src="https://maps.example.org/m" style="border:0;"></iframe>
      HTML
    end

    where(:setting) { described_class::HELPER_TEXT_SETTINGS }

    with_them do
      it 'sanitizes the helper text on save' do
        config.settings['core'][setting] = { 'en' => payload, 'fr-FR' => '<b>gras</b><style>b{}</style>' }
        config.save!

        expect(config.reload.settings('core', setting)).to eq('en' => sanitized, 'fr-FR' => '<b>gras</b>')
      end
    end

    describe 'ampersands' do
      where(:case_name, :input, :output) do
        'typed in text'           | 'Terms & conditions'                         | 'Terms & conditions'
        'next to markup'          | 'AT&T <b>bold</b>'                           | 'AT&T <b>bold</b>'
        'in a link'               | '<a href="https://x.org/?a=1&b=2">x</a>'     | '<a href="https://x.org/?a=1&b=2" rel="nofollow">x</a>'
        'escaped tag stays text'  | '&amp;lt;img src=x onerror=alert(1)&amp;gt;' | '&lt;img src=x onerror=alert(1)&gt;'
        'before a dropped tag'    | '&<img src=x onerror=alert(1)>'              | '&'
      end

      with_them do
        it 'keeps them unescaped' do
          config.settings['core']['enter_email_helper_text'] = { 'en' => input }
          config.save!

          expect(config.reload.settings('core', 'enter_email_helper_text', 'en')).to eq output
        end
      end

      it 'does not let an escaped quote break out of an attribute' do
        input = '<iframe src="https://maps.example.org/m" title="&amp;quot; onload=alert(1) x=&amp;quot;"></iframe>'
        2.times do
          config.settings['core']['enter_email_helper_text'] = { 'en' => input }
          config.save!
          input = config.reload.settings('core', 'enter_email_helper_text', 'en')
        end

        iframe = Nokogiri::HTML.fragment(input).at('iframe')
        expect(iframe.attributes.keys).to contain_exactly('src', 'title')
      end
    end

    it 'leaves other core settings as they are' do
      config.settings['core']['organization_name'] = { 'en' => 'Name <b>bold</b>' }
      config.save!

      expect(config.reload.settings('core', 'organization_name')).to eq('en' => 'Name <b>bold</b>')
    end

    # As when a tenant is created: the configuration being saved is not the current one.
    it "checks iframes against the configuration's own host" do
      settings = config.settings.deep_dup
      settings['core']['enter_email_helper_text'] = { 'en' => '<iframe src="https://ville.example.com/m"></iframe>' }
      other = described_class.send(:new, host: 'ville.example.com', settings: settings)
      other.valid?

      expect(other.settings('core', 'enter_email_helper_text', 'en')).to eq ''
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
        'twilio_confirmation_codes_messaging_service_sid' => 'MG_confirmation_codes'
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

  describe '#base_asset_host_uri (dev S3 branch)' do
    let(:config) { described_class.instance }

    before { allow(Rails.env).to receive(:development?).and_return(true) }

    it 'returns the AWS bucket URL when no endpoint is set' do
      stub_env(
        'USE_AWS_S3_IN_DEV' => 'true',
        'AWS_S3_BUCKET' => 'my-bucket',
        'AWS_REGION' => 'eu-central-1',
        'AWS_ENDPOINT_URL_S3' => nil
      )

      expect(config.base_asset_host_uri)
        .to eq('https://my-bucket.s3.eu-central-1.amazonaws.com')
    end

    it 'returns the bucket URL on the custom endpoint when AWS_ENDPOINT_URL_S3 is set' do
      stub_env(
        'USE_AWS_S3_IN_DEV' => 'true',
        'AWS_S3_BUCKET' => 'my-bucket',
        'AWS_REGION' => 'eu-central-1',
        'AWS_ENDPOINT_URL_S3' => 'https://s3.fr-par.scw.cloud'
      )

      expect(config.base_asset_host_uri)
        .to eq('https://my-bucket.s3.fr-par.scw.cloud')
    end
  end

  describe 'early access' do
    let(:config) { described_class.instance }
    let(:feature) { 'spaces' }

    before do
      config.settings[feature] = { 'allowed' => false, 'enabled' => false }
      config.save!
    end

    describe '#feature_activated?' do
      it 'is false when the feature is off and nobody opted in' do
        expect(config.feature_activated?(feature)).to be false
      end

      it 'is true when the current user opted into the feature' do
        Current.early_access_overrides = Set.new([feature])

        expect(config.feature_activated?(feature)).to be true
      end

      it 'leaves other features alone' do
        Current.early_access_overrides = Set.new([feature])
        config.settings['user_avatars'] = { 'allowed' => false, 'enabled' => false }

        expect(config.feature_activated?('user_avatars')).to be false
      end
    end

    describe '#public_settings' do
      it 'reports an opted-into feature as allowed and enabled' do
        Current.early_access_overrides = Set.new([feature])

        expect(config.public_settings[feature]).to include('allowed' => true, 'enabled' => true)
      end

      it 'reports the feature as off for everybody else' do
        expect(config.public_settings[feature]).to include('allowed' => false, 'enabled' => false)
      end

      it 'adds a feature that is not in the persisted settings yet' do
        config.update_column(:settings, config.settings.except(feature))
        Current.early_access_overrides = Set.new([feature])

        expect(described_class.instance.public_settings[feature]).to eq({ 'allowed' => true, 'enabled' => true })
      end

      it 'does not share the early access upgrade with the front end' do
        config.settings['project_backoffice_redesign'] = {
          'allowed' => false, 'enabled' => false, 'early_access_upgrade' => true
        }
        config.save!

        expect(described_class.instance.public_settings['project_backoffice_redesign']).not_to have_key('early_access_upgrade')
      end

      it 'does not write the override to the persisted settings' do
        Current.early_access_overrides = Set.new([feature])
        config.public_settings

        expect(config.settings[feature]).to include('allowed' => false, 'enabled' => false)
        expect(config.reload.settings[feature]).to include('allowed' => false, 'enabled' => false)
      end
    end
  end
end
