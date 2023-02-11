# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:feature_name) { ContentBuilder::FeatureSpecifications::ProjectDescriptionBuilder.feature_name }

  it 'has the project_description_builder feature flag' do
    expect(described_class.json_schema['properties']).to include(feature_name)
  end
end
