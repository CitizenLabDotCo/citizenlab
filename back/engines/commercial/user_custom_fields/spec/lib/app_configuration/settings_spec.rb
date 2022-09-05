# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  describe 'feature specifications' do
    subject(:feature_specs) { described_class.json_schema['properties'] }

    specify do
      expect(feature_specs['user_custom_fields'])
        .to match(UserCustomFields::FeatureSpecifications::UserCustomFields.json_schema)
    end

    specify do
      expect(feature_specs['representativeness'])
        .to match(UserCustomFields::FeatureSpecifications::Representativeness.json_schema)
    end
  end

  describe 'dependencies' do
    subject(:dependencies) { described_class.json_schema['dependencies'] }

    it { is_expected.to include('representativeness' => ['user_custom_fields']) }
  end
end
