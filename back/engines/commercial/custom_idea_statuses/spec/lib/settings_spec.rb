require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:custom_idea_statuses_feature_name) { CustomIdeaStatuses::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(custom_idea_statuses_feature_name) 
  end
end