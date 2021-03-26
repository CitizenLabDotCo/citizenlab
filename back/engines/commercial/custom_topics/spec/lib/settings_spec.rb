require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:custom_topics_feature_name) { CustomTopics::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(custom_topics_feature_name) 
  end
end