# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration, type: :model do
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

  it 'settings are synced with tenant' do
    core_settings_update = {
      organization_type: 'large_city',
      lifecycle_stage: 'trial',
      currency: 'USD',
      color_main: '#FFFFFF'
    }.stringify_keys!

    config = described_class.instance
    settings = config.settings
    settings['core'].merge!(core_settings_update)
    config.settings = settings
    config.save!

    tenant_core_settings = Tenant.current.settings['core']
    expect(tenant_core_settings).to include(core_settings_update)
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

  context 'when updated' do
    it 'persists & synchronizes only the dirty attributes' do
      app_config = described_class.instance
      another_config_ref = described_class.find(app_config.id)

      # The main color is modified through the other reference.
      new_color = '#000000'
      expect(app_config.settings.dig('core', 'color_main')).not_to eq(new_color) # sanity check
      another_config_ref.settings['core']['color_main'] = new_color
      another_config_ref.save!

      # The value of the +settings+ attribute of +app_config+ is now stale, but it's not
      # dirty and as such the update should not persist it.
      app_config.update!(updated_at: Time.zone.now)
      app_config.reload

      expect(app_config.settings.dig('core', 'color_main')).to eq(new_color)
      expect(Tenant.current.settings.dig('core', 'color_main')).to eq(new_color)
    end
  end
end
