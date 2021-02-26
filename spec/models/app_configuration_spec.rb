# frozen_string_literal: true
require 'rails_helper'

RSpec.describe AppConfiguration, type: :model do

  it 'name is synced with tenant' do
    Tenant.current.update(name: 'Karhide')
    expect(AppConfiguration.instance.name).to eq('Karhide')

    AppConfiguration.instance.update(name: 'Orgoreyn')
    expect(Tenant.current.name).to eq('Orgoreyn')
  end

  it 'host is synced with tenant' do
    Tenant.current.update(host: 'karhide.org')
    Apartment::Tenant.switch!('karhide_org')
    expect(AppConfiguration.instance.host).to eq('karhide.org')

    AppConfiguration.instance.update(host: 'orgoreyn.org')
    expect { Apartment::Tenant.switch!('karhide_org') }.to raise_error(Apartment::TenantNotFound)
    Apartment::Tenant.switch!('orgoreyn_org')
    expect(AppConfiguration.instance.host).to eq('orgoreyn.org')
  end

  it 'settings are synced with tenant' do
    core_settings_update = {
      organization_type: 'large_city',
      lifecycle_stage: 'trial',
      currency: 'USD',
      color_main: '#FFFFFF'
    }.stringify_keys!

    config = AppConfiguration.instance
    settings = config.settings
    settings['core'].merge!(core_settings_update)
    config.settings = settings
    config.save!

    tenant_core_settings = Tenant.current.settings['core']
    expect(tenant_core_settings).to include(core_settings_update)
  end
end

RSpec.describe AppConfiguration::Settings do
  before { described_class.send(:reset) }

  context 'without extension features' do
    describe '.json_schema' do
      it { expect(described_class.json_schema).to match(described_class.core_settings_json_schema) }
      it { expect(described_class.extension_features_specs).to be_empty }
    end
  end

  context 'with one extension feature' do
    let(:feature_spec) do
      Module.new do
        extend CitizenLab::Mixins::FeatureSpecification

        # rubocop:disable Style/SingleLineMethods, Layout/EmptyLineBetweenDefs
        def self.feature_name; 'dummy_feature' end
        def self.feature_title; 'Dummy feature' end
        def self.feature_description; 'Oh my... such a good feature.' end
        # rubocop:enable Style/SingleLineMethods, Layout/EmptyLineBetweenDefs

        add_setting 'dummy setting', required: true, schema: {'type' => 'boolean'}
      end
    end

    before { described_class.add_feature(feature_spec) }

    describe '.json_schema' do
      let(:json_schema) { described_class.json_schema }

      it { expect(json_schema).to include(described_class.core_settings_json_schema) }
      it { expect(json_schema.dig('properties', feature_spec.feature_name)).to eq(feature_spec.json_schema) }
    end

    describe '.extension_features_specs' do
      it { expect(described_class.extension_features_specs.length).to eq(1) }
    end
  end
end
