# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  before do
    @initial_features_hash = described_class.send(:extension_features_hash)
    described_class.send(:reset) # removes all extension features from the class instance var config
    AppConfiguration.instance.tap(&:cleanup_settings).save! # removes all extension features from the DB
  end

  # Restore the initial state of the extension features hash.
  # This should help avoid problems when running subsequent tests (in random orders in CI)
  # which might depend on the descriptions of features previously registered by extensions/engines.
  after do
    described_class.instance_variable_set(:@extension_features_hash, @initial_features_hash)
  end

  shared_examples 'produces_valid_json_schema' do
    it 'produces a valid json schema' do
      metaschema = JSON::Validator.validator_for_name('draft4').metaschema
      expect(JSON::Validator.validate!(metaschema, json_schema)).to be true
    end
  end

  context 'without extension features' do
    describe '.json_schema' do
      subject(:json_schema) { described_class.json_schema }

      it 'uses only the core json schema settings' do
        expect(json_schema).to match(described_class.core_settings_json_schema)
      end

      it 'uses no extension features' do
        expect(described_class.extension_features_specs).to be_empty
      end

      include_examples 'produces_valid_json_schema'
    end
  end

  context 'with one extension feature' do
    let(:feature_spec) do
      Module.new do
        extend CitizenLab::Mixins::FeatureSpecification

        # rubocop:disable Style/SingleLineMethods
        def self.feature_name; 'dummy_feature' end
        def self.feature_title; 'Dummy feature' end
        def self.feature_description; 'Oh my... such a good feature.' end
        # rubocop:enable Style/SingleLineMethods

        add_setting 'dummy setting', required: true, schema: { 'type' => 'boolean' }
      end
    end

    before { described_class.add_feature(feature_spec) }

    describe '.json_schema' do
      let(:json_schema) { described_class.json_schema }

      it 'includes core json schema settings in schema' do
        expect(json_schema.except('properties')).to eq(described_class.core_settings_json_schema.except('properties'))
        # json_schema['properties'] has `dummy_feature` which is not included in core_settings_json_schema['properties']
        expect(json_schema['properties'].except(feature_spec.feature_name))
          .to eq(described_class.core_settings_json_schema['properties'])
      end

      it 'includes feature json schema in properties' do
        expect(json_schema.dig('properties', feature_spec.feature_name)).to eq(feature_spec.json_schema)
      end

      include_examples 'produces_valid_json_schema'
    end

    describe '.extension_features_specs' do
      it { expect(described_class.extension_features_specs.length).to eq(1) }
    end

    describe '.early_access_features' do
      it 'does not include the feature by default' do
        expect(described_class.early_access_features).not_to include(feature_spec.feature_name)
      end

      context 'when the feature declares itself early access' do
        before { feature_spec.define_singleton_method(:early_access?) { true } }

        it 'includes the feature' do
          expect(described_class.early_access_features).to include(feature_spec.feature_name)
        end

        it 'marks the feature in the json schema' do
          expect(described_class.json_schema.dig('properties', feature_spec.feature_name, 'early_access')).to be true
        end
      end
    end
  end

  describe '.early_access_features' do
    it 'includes the core features marked early access' do
      marked = described_class.core_settings_json_schema['properties']
        .select { |_name, feature| feature['early_access'] }.keys

      expect(described_class.early_access_features).to match_array(marked)
    end

    # The override only lifts `allowed`/`enabled`, so it cannot satisfy a
    # dependency or conjure a required setting.
    it 'only marks features that need nothing else to work' do
      schema = described_class.json_schema

      described_class.early_access_features.each do |feature|
        expect(schema.dig('properties', feature, 'required-settings')).to be_nil
        expect(schema.dig('dependencies', feature)).to be_nil
      end
    end
  end

  describe 'core settings' do
    it 'requires lifecycle stage' do
      config = AppConfiguration.instance
      config.settings['core'].except! 'lifecycle_stage'
      expect(config.update(settings: config.settings)).to be false
    end

    it 'requires country_code' do
      config = AppConfiguration.instance
      config.settings['core'].except! 'country_code'
      expect(config).not_to be_valid
    end

    it 'requires timezone as it is in `required-settings`' do
      config = AppConfiguration.instance
      config.settings['core'].except! 'timezone'
      expect(config.update(settings: config.settings)).to be false
    end

    it 'does not require timezone if `core` feature is disabled' do
      SettingsService.new.deactivate_feature!('core')
      config = AppConfiguration.instance
      config.settings['core'].except! 'timezone'
      expect(config.update(settings: config.settings)).to be true
    end
  end
end
