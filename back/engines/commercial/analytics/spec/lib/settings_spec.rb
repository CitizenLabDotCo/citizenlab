# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:analytics_feature_name) { Analytics::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(analytics_feature_name)
  end
end
