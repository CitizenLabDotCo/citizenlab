require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:moderation_feature_name) { Moderation::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(moderation_feature_name) 
  end
end