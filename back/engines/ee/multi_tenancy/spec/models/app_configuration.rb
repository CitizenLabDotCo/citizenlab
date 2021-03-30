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
end
