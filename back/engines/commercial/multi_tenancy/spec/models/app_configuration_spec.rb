# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration do
  subject(:app_config) { described_class.instance }

  context 'when updated' do
    it 'name is synced with tenant' do
      Tenant.current.update(name: 'Karhide')
      expect(described_class.instance.name).to eq('Karhide')

      described_class.instance.update(name: 'Orgoreyn')
      expect(Tenant.current.name).to eq('Orgoreyn')
    end

    it 'host is synced with tenant' do
      Tenant.current.update(host: 'karhide.org')
      Apartment::Tenant.switch!('karhide_org')
      expect(described_class.instance.host).to eq('karhide.org')

      described_class.instance.update(host: 'orgoreyn.org')
      expect { Apartment::Tenant.switch!('karhide_org') }.to raise_error(Apartment::TenantNotFound)
      Apartment::Tenant.switch!('orgoreyn_org')
      expect(described_class.instance.host).to eq('orgoreyn.org')
    end

    it 'persists & synchronizes only the dirty attributes' do
      another_config_ref = described_class.find(app_config.id)

      # The +created_at+ attribute is modified through the other reference.
      new_created_at = another_config_ref.created_at + 1
      another_config_ref.update!(created_at: new_created_at)

      # The value of the +created_at+ attribute of +app_config+ is now stale, but it's
      # not dirty and as such the update should not persist it.
      app_config.update!(updated_at: Time.zone.now)
      app_config.reload

      expect(app_config.created_at).to eq(new_created_at)
      expect(Tenant.current.created_at).to eq(new_created_at)
    end
  end

  describe 'Lifecycle stage' do
    it 'cannot be changed from demo to something else' do
      config = described_class.instance
      config.settings['core']['lifecycle_stage'] = 'demo'
      config.update_column :settings, config.settings
      config.settings['core']['lifecycle_stage'] = 'active'
      expect(config.update(settings: config.settings)).to be_falsey
    end

    it 'cannot be changed from something else to demo' do
      config = described_class.instance
      config.settings['core']['lifecycle_stage'] = 'churned'
      config.update_column :settings, config.settings
      config.settings['core']['lifecycle_stage'] = 'demo'
      expect(config.update(settings: config.settings)).to be_falsey
    end

    it 'can be changed from something else to something else' do
      config = described_class.instance
      config.settings['core']['lifecycle_stage'] = 'active'
      config.update_column :settings, config.settings
      config.settings['core']['lifecycle_stage'] = 'churned'
      expect(config.update(settings: config.settings)).to be_truthy
    end

    it 'can remain demo' do
      config = described_class.instance
      config.settings['core']['lifecycle_stage'] = 'demo'
      config.settings['core']['currency'] = 'EUR'
      config.update_column :settings, config.settings
      config.settings['core']['currency'] = 'CHF'
      expect(config.update(settings: config.settings)).to be_truthy
    end
  end

  describe '#closest_locale_to' do
    let(:app_config) do
      create(:tenant, host: 'something.else-than-the-default-test-tenant').configuration
    end

    it 'returns the locale itself if it is present' do
      app_config.settings['core']['locales'] = %w[en nl-BE]
      expect(app_config.closest_locale_to('nl-BE')).to eq 'nl-BE'
    end

    it 'returns the first locale when the requested locale is not present' do
      app_config.settings['core']['locales'] = %w[en nl-BE]
      expect(app_config.closest_locale_to('de-DE')).to eq 'en'
    end

    # An OmniAuth response (following SSO with, for example, Google) often includes a
    # 2 character locale code, which we try to match against our longer codes.
    it 'returns the first locale containing a matching 2 character substring' do
      app_config.settings['core']['locales'] = %w[en nl-BE]
      expect(app_config.closest_locale_to('nl')).to eq 'nl-BE'
    end
  end

  describe '#style' do
    it 'can never be nil' do
      app_config.update(style: nil)
      expect(app_config.style).to eq({})
    end
  end

  describe '#public_settings' do
    it 'does not include private fields' do
      app_config.settings['franceconnect_login'] = {
        allowed: true,
        enabled: true,
        environment: 'production',
        identifier: 'id',
        secret: 'secret',
        scope: %w[email given_name family_name]
      }
      app_config.settings['verification'] = {
        allowed: true, enabled: true, verification_methods: [
          { name: 'clave_unica', client_id: '123', client_secret: '321' }
        ]
      }
      app_config.save!

      expect(app_config.public_settings['franceconnect_login']).to eq({ 'allowed' => true, 'enabled' => true })
      expect(app_config.public_settings['verification']).to eq({ 'allowed' => true, 'enabled' => true })
    end
  end
end
