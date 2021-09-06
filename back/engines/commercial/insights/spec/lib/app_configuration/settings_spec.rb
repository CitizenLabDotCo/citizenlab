# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:insights_manual_flow_feature_name) {}

  it 'have insights manual-flow feature' do
    feature_name = Insights::FeatureSpecifications::ManualFlow.feature_name
    expect(described_class.extension_features).to include(feature_name)
  end

  it 'have insights nlp-flow feature' do
    feature_name = Insights::FeatureSpecifications::NlpFlow.feature_name
    expect(described_class.extension_features).to include(feature_name)
  end
end
