# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  describe 'feature specifications' do
    subject(:feature_specs) { described_class.json_schema['properties'] }

    specify do
      expect(feature_specs['representativeness'])
        .to match(UserCustomFields::FeatureSpecifications::Representativeness.json_schema)
    end
  end
end
