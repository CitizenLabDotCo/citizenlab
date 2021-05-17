require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:insights_manual_flow_feature_name) { Insights::FeatureSpecifications::ManualFlow.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(insights_manual_flow_feature_name)
  end
end
